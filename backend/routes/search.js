const express = require('express');
const Resource = require('../models/Resource');

const router = express.Router();

// Search resources with pagination
router.get('/', async (req, res) => {
  try {
    const { keyword, subject, gradeLevel, licenseType, sortBy, page = 1, limit = 12 } = req.query;
    
    // Validate and sanitize pagination parameters
    let pageNum = parseInt(page) || 1;
    let limitNum = parseInt(limit) || 12;
    
    if (pageNum < 1) pageNum = 1;
    if (limitNum < 1) limitNum = 12;
    if (limitNum > 100) limitNum = 100; // Cap at 100 to prevent DoS
    
    const filter = { status: 'approved' };
    
    if (subject) filter.subject = subject;
    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (licenseType) filter.licenseType = licenseType;
    
    if (keyword) {
      // Escape special regex characters to prevent ReDoS
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escapedKeyword, $options: 'i' } },
        { description: { $regex: escapedKeyword, $options: 'i' } },
        { author: { $regex: escapedKeyword, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'rating') sortOption = { averageRating: -1 };
    if (sortBy === 'downloads') sortOption = { downloadCount: -1 };
    if (sortBy === 'title') sortOption = { title: 1 };

    const skip = (pageNum - 1) * limitNum;

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
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get filter options
router.get('/filters', async (req, res) => {
  try {
    const subjects = await Resource.distinct('subject', { status: 'approved' });
    const gradeLevels = await Resource.distinct('gradeLevel', { status: 'approved' });
    const licenseTypes = await Resource.distinct('licenseType', { status: 'approved' });

    res.json({
      success: true,
      filters: {
        subjects,
        gradeLevels,
        licenseTypes
      }
    });
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
