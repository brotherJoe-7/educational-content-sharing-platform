const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const { protect } = require('../middleware/auth');
const { storage, cloudinary } = require('../config/cloudinary');

const router = express.Router();

const buildCloudinaryUrl = (resource) => {
  if (!resource.cloudinaryPublicId) {
    return resource.fileUrl;
  }

  const resourceType = resource.resourceType || (['JPG', 'PNG'].includes(resource.fileType) ? 'image' : 'raw');
  const format = resource.fileName?.split('.').pop();
  const options = {
    resource_type: resourceType,
    secure: true
  };
  // Use signed URLs for raw/document files to allow authorized access
  if (resourceType === 'raw' || ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'TXT'].includes(resource.fileType)) {
    options.sign_url = true;
    options.type = 'authenticated';
  }

  if (format) options.format = format.toLowerCase();

  try {
    if (options.sign_url) {
      // Use private download URL helper for signed access to protected assets
      return cloudinary.utils.private_download_url(resource.cloudinaryPublicId, { resource_type: resourceType, format: options.format });
    }
    return cloudinary.url(resource.cloudinaryPublicId, options);
  } catch (error) {
    console.error('Cloudinary URL build failed:', error);
    return resource.fileUrl;
  }
};

// Configure multer with Cloudinary storage
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG files are allowed.'));
    }
  }
});

// Upload resource
router.post('/upload', protect, upload.single('file'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('gradeLevel').notEmpty().withMessage('Grade level is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('licenseType').notEmpty().withMessage('License type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const { title, description, subject, gradeLevel, author, licenseType } = req.body;

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

    // Create resource with Cloudinary metadata
    const resource = await Resource.create({
      title,
      description,
      subject,
      gradeLevel,
      author,
      licenseType,
      fileType,
      fileUrl: secureUrl,
      resourceType: cloudinaryResourceType,
      cloudinaryPublicId: req.file.filename,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      status: 'pending',
      auditTrail: [{
        action: 'uploaded',
        performedBy: req.user.id,
        details: 'Resource uploaded and pending approval'
      }]
    });

    res.status(201).json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Server error during upload' });
  }
});

// Get all approved resources with pagination
router.get('/', async (req, res) => {
  try {
    const { subject, gradeLevel, licenseType, page = 1, limit = 12, sortBy = 'createdAt' } = req.query;
    
    const filter = { status: 'approved' };
    if (subject) filter.subject = subject;
    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (licenseType) filter.licenseType = licenseType;

    // Validate and sanitize pagination parameters
    let pageNum = parseInt(page) || 1;
    let limitNum = parseInt(limit) || 12;
    
    if (pageNum < 1) pageNum = 1;
    if (limitNum < 1) limitNum = 12;
    if (limitNum > 100) limitNum = 100; // Cap at 100 to prevent DoS
    
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    let sortOption = {};
    if (sortBy === 'rating') sortOption = { averageRating: -1 };
    else if (sortBy === 'downloads') sortOption = { downloadCount: -1 };
    else if (sortBy === 'title') sortOption = { title: 1 };
    else sortOption = { createdAt: -1 };

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .populate('uploadedBy', 'name email')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Resource.countDocuments(filter)
    ]);

    const resourcesWithUrls = resources.map((resource) => {
      const doc = resource.toObject();
      doc.fileUrl = buildCloudinaryUrl(resource);
      return doc;
    });

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      count: resourcesWithUrls.length,
      total,
      totalPages,
      currentPage: pageNum,
      resources: resourcesWithUrls
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single resource
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid resource ID format' });
    }

    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('ratings.user', 'name');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.status !== 'approved') {
      return res.status(403).json({ message: 'Resource not approved' });
    }

    const resourceData = resource.toObject();
    resourceData.fileUrl = buildCloudinaryUrl(resource);

    res.json({
      success: true,
      resource: resourceData
    });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download resource (protected by backend, tracks downloads)
router.get('/:id/download', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid resource ID format' });
    }

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.status !== 'approved') {
      return res.status(403).json({ message: 'Resource not approved' });
    }

    // Increment download count
    resource.downloadCount += 1;
    await resource.save();

    // Return a proxy download URL (server will stream the file)
    const proxyUrl = `${req.protocol}://${req.get('host')}/api/resources/${resource._id}/download/proxy`;
    res.json({
      success: true,
      downloadUrl: proxyUrl,
      fileName: resource.fileName
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error during download' });
  }
});

// Proxy download endpoint: streams file from Cloudinary via server (uses API credentials)
router.get('/:id/download/proxy', async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid resource ID format' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.status !== 'approved') return res.status(403).json({ message: 'Resource not approved' });

    // Increment download count
    resource.downloadCount += 1;
    await resource.save();

    const publicId = resource.cloudinaryPublicId;
    const format = resource.fileName?.split('.').pop()?.toLowerCase();
    const resourceType = resource.resourceType || (/\.(jpg|jpeg|png)$/i.test(resource.fileName) ? 'image' : 'raw');

    // Build a private download URL and fetch it with API credentials
    const downloadUrl = cloudinary.utils.private_download_url(publicId, { resource_type: resourceType, format });
    const auth = Buffer.from(`${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`).toString('base64');

    const upstream = await fetch(downloadUrl, { headers: { Authorization: `Basic ${auth}` } });
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      console.error('Upstream fetch failed', upstream.status, text.substring(0, 200));
      return res.status(502).json({ message: 'Failed to retrieve file from storage' });
    }

    // Stream headers
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const contentLength = upstream.headers.get('content-length');
    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Content-Disposition', `attachment; filename="${resource.fileName}"`);

    // Stream body
    const body = upstream.body;
    if (body && typeof body.pipe === 'function') {
      body.pipe(res);
    } else {
      const buffer = await upstream.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (error) {
    console.error('Proxy download error:', error);
    res.status(500).json({ message: 'Server error during proxy download' });
  }
});

// Add rating/comment
router.post('/:id/rating', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const { rating, comment } = req.body;

    // Check if user already rated
    const existingRating = resource.ratings.find(r => r.user.toString() === req.user.id);
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.comment = comment;
      existingRating.createdAt = Date.now();
    } else {
      resource.ratings.push({
        user: req.user.id,
        rating,
        comment
      });
    }

    await resource.save();

    res.json({
      success: true,
      resource
    });
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
