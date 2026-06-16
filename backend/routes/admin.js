const express = require('express');
const { body, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const User = require('../models/User');
const SystemLog = require('../models/SystemLog');
const { protect, authorize } = require('../middleware/auth');
const { cloudinary } = require('../config/cloudinary');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Multer using Cloudinary storage for re-uploads
const reupload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type for reupload'));
  }
});

const router = express.Router();

// Async helper: fetch the real Cloudinary URL via Admin API (handles strict delivery)
const getCloudinaryStreamUrl = async (resource) => {
  if (!resource.cloudinaryPublicId) return { url: resource.fileUrl, isArchive: false };
  const resourceType = resource.resourceType || 'raw';
  try {
    if (resourceType === 'raw') {
      const info = await cloudinary.api.resource(resource.cloudinaryPublicId, {
        resource_type: 'raw', type: 'upload'
      });
      return { url: info.secure_url, isArchive: false };
    }
    // image-type assets blocked by strict delivery — use archive
    const archiveUrl = cloudinary.utils.download_archive_url({
      public_ids: [resource.cloudinaryPublicId],
      resource_type: resourceType,
      target_format: 'zip',
      flatten_folders: true,
      use_original_filename: true,
      async: false
    });
    return { url: archiveUrl, isArchive: true };
  } catch (err) {
    console.error('[Cloudinary] Admin lookup failed:', err.error?.message || err.message);
    return { url: resource.fileUrl, isArchive: false };
  }
};



// Get all pending resources
router.get('/resources/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const resources = await Resource.find({ status: 'pending' })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    console.error('Get pending resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all resources (including rejected)
router.get('/resources/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const resources = await Resource.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    console.error('Get all resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve resource
router.put('/resources/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Validate state transition (can only approve pending resources)
    if (resource.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot approve a ${resource.status} resource` });
    }

    resource.status = 'approved';
    resource.auditTrail.push({
      action: 'approved',
      performedBy: req.user.id,
      details: 'Resource approved by admin'
    });

    await resource.save();

    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Approve resource error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reject resource
router.put('/resources/:id/reject', protect, authorize('admin'), [
  body('reason').trim().notEmpty().withMessage('Rejection reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Validate state transition (can only reject pending resources)
    if (resource.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot reject a ${resource.status} resource` });
    }

    resource.status = 'rejected';
    resource.auditTrail.push({
      action: 'rejected',
      performedBy: req.user.id,
      details: `Resource rejected. Reason: ${req.body.reason}`
    });

    await resource.save();

    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Reject resource error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a resource
router.delete('/resources/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Delete from Cloudinary if public ID exists
    if (resource.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(resource.cloudinaryPublicId, {
          resource_type: resource.resourceType === 'raw' ? 'raw' : 'image'
        });
      } catch (cloudErr) {
        console.error('Cloudinary deletion error:', cloudErr);
        // Continue even if cloudinary deletion fails to ensure DB is cleaned up
      }
    }

    await Resource.findByIdAndDelete(req.params.id);

    // Log the deletion
    await SystemLog.create({
      action: 'deleted_resource',
      details: `Deleted resource: ${resource.title}`,
      performedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all users (admin only) - restrict sensitive data
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -privacyConsent')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get file with admin verification and audit trail
router.get('/resources/:id/file', protect, authorize('admin'), async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Only allow viewing of non-rejected resources
    if (resource.status === 'rejected') {
      return res.status(403).json({ success: false, message: 'Cannot access rejected resource file' });
    }

    // Log file access in audit trail
    resource.auditTrail.push({
      action: 'file_accessed',
      performedBy: req.user.id,
      details: `File viewed by admin (${resource.fileName})`
    });
    await resource.save();

    const { url: fileUrl } = await getCloudinaryStreamUrl(resource);
    const hasAuthHeader = !!req.headers.authorization;
    if (hasAuthHeader) {
      return res.json({ success: true, fileUrl });
    }

    const acceptsJson = req.headers.accept && req.headers.accept.indexOf('application/json') !== -1;
    if (acceptsJson) {
      return res.json({ success: true, fileUrl });
    }

    res.redirect(fileUrl);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin inline file proxy (to prevent direct Cloudinary downloads)
router.get('/resources/:id/proxy', protect, authorize('admin'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const { url: streamUrl, isArchive } = await getCloudinaryStreamUrl(resource);
    const upstream = await fetch(streamUrl);
    if (!upstream.ok) return res.status(502).json({ message: 'Failed to fetch from storage' });

    res.setHeader('Content-Disposition', `inline; filename="${resource.fileName}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('Cross-Origin-Resource-Policy');

    if (isArchive) {
      res.setHeader('Content-Type', resource.fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
      const { Readable } = require('stream');
      const unzipper = require('unzipper');
      Readable.fromWeb(upstream.body).pipe(unzipper.Parse())
        .on('entry', (entry) => entry.pipe(res))
        .on('error', () => { if (!res.headersSent) res.status(502).json({ message: 'Unzip failed' }); });
    } else {
      let contentType = upstream.headers.get('content-type') || 'application/octet-stream';
      if (resource.fileName.toLowerCase().endsWith('.pdf')) contentType = 'application/pdf';
      res.setHeader('Content-Type', contentType);
      
      const body = upstream.body;
      if (body && typeof body.pipe === 'function') body.pipe(res);
      else {
        const buffer = await upstream.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
    }
  } catch (error) {
    console.error('Admin proxy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Return the signed/private file URL for admin clients (AJAX)
router.get('/resources/:id/file/url', protect, authorize('admin'), async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
    }
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    if (resource.status === 'rejected') return res.status(403).json({ success: false, message: 'Cannot access rejected resource file' });

    const { url: fileUrl } = await getCloudinaryStreamUrl(resource);
    return res.json({ success: true, fileUrl });
  } catch (error) {
    console.error('Get file URL error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Re-upload resource file (admin) - replaces Cloudinary asset and updates DB
router.post('/resources/:id/reupload', protect, authorize('admin'), reupload.single('file'), async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });

    // Determine file type
    let fileType = 'Other';
    if (req.file.mimetype === 'application/pdf') fileType = 'PDF';
    else if (req.file.mimetype.includes('word')) fileType = req.file.mimetype.includes('openxml') ? 'DOCX' : 'DOC';
    else if (req.file.mimetype.includes('powerpoint')) fileType = req.file.mimetype.includes('openxml') ? 'PPTX' : 'PPT';
    else if (req.file.mimetype === 'text/plain') fileType = 'TXT';
    else if (req.file.mimetype === 'image/jpeg') fileType = 'JPG';
    else if (req.file.mimetype === 'image/png') fileType = 'PNG';

    const cloudinaryResourceType = req.file.resource_type || (req.file.mimetype.startsWith('image/') ? 'image' : 'raw');
    const secureUrl = req.file.secure_url || req.file.path;

    // Update resource
    resource.cloudinaryPublicId = req.file.filename;
    resource.fileUrl = secureUrl;
    resource.fileName = req.file.originalname;
    resource.fileSize = req.file.size;
    resource.fileType = fileType;
    resource.resourceType = cloudinaryResourceType;
    resource.auditTrail.push({ action: 'reuploaded', performedBy: req.user.id, details: `File reuploaded by admin (${req.user.id})` });

    await resource.save();

    res.json({ success: true, resource });
  } catch (error) {
    console.error('Reupload error:', error);
    res.status(500).json({ success: false, message: 'Server error during reupload' });
  }
});

// Promote user to admin
router.put('/users/:id/promote', protect, authorize('admin'), async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-promotion
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot promote yourself' });
    }

    // Prevent re-promoting already admin users
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'User is already an admin' });
    }

    const previousRole = user.role;
    user.role = 'admin';
    await user.save();

    // Log the promotion action
    console.log(`[AUDIT] User ${req.user.id} promoted user ${user._id} from ${previousRole} to admin at ${new Date().toISOString()}`);

    await SystemLog.create({
      action: 'promoted_user',
      details: `Promoted user ${user.email} to administrator`,
      performedBy: req.user.id
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Promote user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }
    
    // Optional: Delete user's resources or mark them as suspended
    // For now, we will just delete the user
    await User.findByIdAndDelete(req.params.id);
    
    await SystemLog.create({
      action: 'deleted_user',
      details: `Deleted user ${user.email}`,
      performedBy: req.user.id
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Suspend or Activate a user
router.put('/users/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'active' or 'suspended'
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot modify your own status' });
    }
    if (user.email === 'admin@educonnectsl.org') {
      return res.status(403).json({ success: false, message: 'Cannot suspend the root administrator' });
    }
    
    user.status = status;
    await user.save();
    
    await SystemLog.create({
      action: status === 'suspended' ? 'suspended_user' : 'activated_user',
      details: `${status === 'suspended' ? 'Suspended' : 'Activated'} user ${user.email}`,
      performedBy: req.user.id
    });

    res.json({ success: true, message: `User ${status} successfully`, user });
  } catch (error) {
    console.error('Change user status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get system activity logs (derived from resource audit trails and system logs)
router.get('/logs', protect, authorize('admin'), async (req, res) => {
  try {
    const [resources, systemLogs] = await Promise.all([
      Resource.find({ 'auditTrail.0': { $exists: true } })
        .select('title auditTrail')
        .populate('auditTrail.performedBy', 'name email'),
      SystemLog.find().populate('performedBy', 'name email')
    ]);

    let logs = [];
    resources.forEach(res => {
      res.auditTrail.forEach(log => {
        logs.push({
          resourceId: res._id,
          resourceTitle: res.title,
          action: log.action,
          details: log.details,
          performedBy: log.performedBy,
          timestamp: log.createdAt || log.timestamp || new Date()
        });
      });
    });

    systemLogs.forEach(log => {
      logs.push({
        action: log.action,
        details: log.details,
        performedBy: log.performedBy,
        timestamp: log.createdAt
      });
    });

    // Sort by most recent
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      logs: logs.slice(0, 50)
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats with enhanced analytics
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalResources = await Resource.countDocuments();
    const pendingResources = await Resource.countDocuments({ status: 'pending' });
    const approvedResources = await Resource.countDocuments({ status: 'approved' });
    const rejectedResources = await Resource.countDocuments({ status: 'rejected' });
    
    // Uploads per week (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const uploadsLastWeek = await Resource.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Uploads per week (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const uploadsLastMonth = await Resource.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Active users (users who uploaded in last 30 days)
    const activeUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Total downloads
    const totalDownloads = await Resource.aggregate([
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]);

    // Resources by subject
    const resourcesBySubject = await Resource.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Resources by grade level
    const resourcesByGrade = await Resource.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$gradeLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent resources
    const recentResources = await Resource.find()
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Most downloaded resources
    const mostDownloaded = await Resource.find({ status: 'approved' })
      .populate('uploadedBy', 'name')
      .sort({ downloadCount: -1 })
      .limit(5);

    // Highest rated resources
    const highestRated = await Resource.find({ status: 'approved', averageRating: { $gt: 0 } })
      .populate('uploadedBy', 'name')
      .sort({ averageRating: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalResources,
        pendingResources,
        approvedResources,
        rejectedResources,
        uploadsLastWeek,
        uploadsLastMonth,
        activeUsers,
        totalDownloads: totalDownloads[0]?.total || 0
      },
      analytics: {
        resourcesBySubject,
        resourcesByGrade
      },
      recentResources,
      mostDownloaded,
      highestRated
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

