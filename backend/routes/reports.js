const express = require('express');
const { body, validationResult } = require('express-validator');
const Report = require('../models/Report');
const Resource = require('../models/Resource');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Report a resource
router.post('/', protect, [
  body('resourceId').notEmpty().withMessage('Resource ID is required'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('description').trim().notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resourceId, reason, description } = req.body;

    // Check if resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user already reported this resource
    const existingReport = await Report.findOne({
      resource: resourceId,
      reportedBy: req.user.id
    });

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this resource' });
    }

    // Create report
    const report = await Report.create({
      resource: resourceId,
      reportedBy: req.user.id,
      reason,
      description
    });

    res.status(201).json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reports (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const reports = await Report.find(filter)
      .populate('resource', 'title author')
      .populate('reportedBy', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single report (admin only)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid report ID format' });
    }

    const report = await Report.findById(req.params.id)
      .populate('resource')
      .populate('reportedBy', 'name email')
      .populate('reviewedBy', 'name');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Review report (admin only)
router.put('/:id/review', protect, authorize('admin'), [
  body('status').isIn(['reviewed', 'resolved', 'dismissed']).withMessage('Invalid status'),
  body('resolution').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid report ID format' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = req.body.status;
    report.reviewedBy = req.user.id;
    report.reviewedAt = Date.now();
    if (req.body.resolution) {
      report.resolution = req.body.resolution;
    }

    await report.save();

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Review report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get report statistics (admin only)
router.get('/stats/summary', protect, authorize('admin'), async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const reviewedReports = await Report.countDocuments({ status: 'reviewed' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });
    const dismissedReports = await Report.countDocuments({ status: 'dismissed' });

    // Reports by reason
    const reportsByReason = await Report.aggregate([
      { $group: { _id: '$reason', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalReports,
        pendingReports,
        reviewedReports,
        resolvedReports,
        dismissedReports
      },
      reportsByReason
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
