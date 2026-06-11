const express = require('express');
const { body, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

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
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
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

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
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

// Get all users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
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

// Promote user to admin
router.put('/users/:id/promote', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = 'admin';
    await user.save();

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
