const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const SystemLog = require('../models/SystemLog');
const { protect } = require('../middleware/auth');
const { storage, cloudinary } = require('../config/cloudinary');
const unzipper = require('unzipper');

const getIp = (req) => req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';

const router = express.Router();

/**
 * Get streamable info for a Cloudinary asset.
 * Returns { url, isArchive } where isArchive=true means the URL
 * is a zip (generate_archive) that must be extracted before streaming.
 */
const getCloudinaryStreamUrl = async (resource) => {
  if (!resource.cloudinaryPublicId) return { url: resource.fileUrl, isArchive: false };

  const resourceType = resource.resourceType || 'raw';

  try {
    // raw-type files work directly from CDN under strict delivery
    if (resourceType === 'raw') {
      const info = await cloudinary.api.resource(resource.cloudinaryPublicId, {
        resource_type: 'raw',
        type: 'upload'
      });
      return { url: info.secure_url, isArchive: false };
    }

    // image-type files (e.g., PDFs mis-typed at upload) are blocked by strict
    // delivery CDN. Use generate_archive to get a short-lived download URL —
    // the response will be a zip that we extract on the fly.
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
    console.error('[Cloudinary] Lookup failed:', err.error?.message || err.message);
    return { url: resource.fileUrl, isArchive: false };
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

    // Log the upload
    await SystemLog.create({
      action: 'resource_uploaded',
      details: `Resource uploaded: "${title}" (${fileType}) — Pending admin approval`,
      performedBy: req.user.id,
      resourceTitle: title,
      ipAddress: getIp(req),
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({ success: true, resource });
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

    const resourcesWithUrls = await Promise.all(resources.map(async (resource) => {
      const doc = resource.toObject();
      const { url } = await getCloudinaryStreamUrl(resource);
      doc.fileUrl = url;
      return doc;
    }));

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
    const { url: fileUrl } = await getCloudinaryStreamUrl(resource);
    resourceData.fileUrl = fileUrl;

    // Log resource view (fire-and-forget, don't await to keep response fast)
    SystemLog.create({
      action: 'resource_viewed',
      details: `Resource viewed: "${resource.title}"`,
      resourceTitle: resource.title,
      ipAddress: getIp(req),
      userAgent: req.headers['user-agent']
    }).catch(() => {});

    res.json({ success: true, resource: resourceData });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download resource: increments counter then returns proxy URL
router.get('/:id/download', async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid resource ID format' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.status !== 'approved') return res.status(403).json({ message: 'Resource not approved' });

    // Increment download count here (single source of truth)
    resource.downloadCount += 1;
    await resource.save();

    // Log the download
    await SystemLog.create({
      action: 'resource_downloaded',
      details: `Resource downloaded: "${resource.title}" (total downloads: ${resource.downloadCount})`,
      resourceTitle: resource.title,
      ipAddress: getIp(req),
      userAgent: req.headers['user-agent']
    });

    const proxyUrl = `${req.protocol}://${req.get('host')}/api/resources/${resource._id}/download/proxy`;
    res.json({ success: true, downloadUrl: proxyUrl, fileName: resource.fileName });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error during download' });
  }
});

// Proxy download: streams file from Cloudinary through our server
router.get('/:id/download/proxy', async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid resource ID format' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.status !== 'approved') return res.status(403).json({ message: 'Resource not approved' });

    // getCloudinaryStreamUrl returns { url, isArchive }
    const { url: streamUrl, isArchive } = await getCloudinaryStreamUrl(resource);
    console.log(`[PROXY] Fetching (isArchive=${isArchive}): ${streamUrl.substring(0, 100)}...`);

    const upstream = await fetch(streamUrl);
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      console.error(`[PROXY] Cloudinary returned ${upstream.status}:`, text.substring(0, 300));
      return res.status(502).json({ message: 'Failed to retrieve file from storage' });
    }

    const isInline = req.query.inline === 'true';
    const disposition = isInline ? 'inline' : 'attachment';
    res.setHeader('Content-Disposition', `${disposition}; filename="${resource.fileName}"`);
    res.setHeader('Cache-Control', 'no-cache');

    if (isInline) {
      // Remove helmet security headers that block cross-origin (different port) framing
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');
      res.removeHeader('Cross-Origin-Resource-Policy');
    }

    if (isArchive) {
      // The response is a ZIP — convert Web stream → Node stream, then extract the first entry
      res.setHeader('Content-Type', resource.fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
      const { Readable } = require('stream');
      const nodeReadable = Readable.fromWeb(upstream.body);
      nodeReadable
        .pipe(unzipper.Parse())
        .on('entry', (entry) => {
          entry.pipe(res);
        })
        .on('error', (err) => {
          console.error('[PROXY] Unzip error:', err.message);
          if (!res.headersSent) res.status(502).json({ message: 'Failed to extract file from archive' });
        });
    } else {
      // Direct stream
      let contentType = upstream.headers.get('content-type') || 'application/octet-stream';
      
      // Override octet-stream for known extensions so the browser can view it inline
      if (resource.fileName.toLowerCase().endsWith('.pdf')) {
        contentType = 'application/pdf';
      }
      
      const contentLength = upstream.headers.get('content-length');
      res.setHeader('Content-Type', contentType);
      if (contentLength) res.setHeader('Content-Length', contentLength);

      const body = upstream.body;
      if (body && typeof body.pipe === 'function') {
        body.pipe(res);
      } else {
        const buffer = await upstream.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
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

    // Log the rating
    await SystemLog.create({
      action: 'resource_rated',
      details: `Resource rated: "${resource.title}" — ${rating} star${rating > 1 ? 's' : ''}${comment ? ' with comment' : ''}`,
      performedBy: req.user.id,
      resourceTitle: resource.title,
      ipAddress: getIp(req),
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true, resource });
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
