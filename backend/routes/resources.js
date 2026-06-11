const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const { protect } = require('../middleware/auth');
const { storage, cloudinary } = require('../config/cloudinary');

const router = express.Router();

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

    // Create resource with Cloudinary URL
    const resource = await Resource.create({
      title,
      description,
      subject,
      gradeLevel,
      author,
      licenseType,
      fileType,
      fileUrl: req.file.path, // Cloudinary URL
      cloudinaryPublicId: req.file.filename, // Cloudinary public ID
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

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      count: resources.length,
      total,
      totalPages,
      currentPage: pageNum,
      resources
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

    res.json({
      success: true,
      resource
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

    // Return download URL instead of redirecting
    // This allows frontend to track and handle downloads properly
    res.json({
      success: true,
      downloadUrl: resource.fileUrl,
      fileName: resource.fileName
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error during download' });
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
