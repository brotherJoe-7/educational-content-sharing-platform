const express = require('express');
const Resource = require('../models/Resource');
const User = require('../models/User');

const router = express.Router();

// Public platform statistics (no auth required)
router.get('/', async (req, res) => {
  try {
    const [
      totalResources,
      totalUsers,
      totalDownloadsAgg,
      avgRatingAgg,
    ] = await Promise.all([
      Resource.countDocuments({ status: 'approved' }),
      User.countDocuments(),
      Resource.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$downloadCount' } } }
      ]),
      Resource.aggregate([
        { $match: { status: 'approved', averageRating: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$averageRating' } } }
      ])
    ]);

    // Get trending subjects based on highest download counts
    const trendingSubjectsAgg = await Resource.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$subject', totalDownloads: { $sum: '$downloadCount' } } },
      { $sort: { totalDownloads: -1 } },
      { $limit: 6 }
    ]);
    const trendingSubjects = trendingSubjectsAgg.map(s => s._id);

    // Get a few recent resources to show on the homepage
    const recentResources = await Resource.find({ status: 'approved' })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

    res.json({
      success: true,
      stats: {
        totalResources,
        totalUsers,
        totalDownloads: totalDownloadsAgg[0]?.total || 0,
        averageRating: avgRatingAgg[0]?.avg
          ? parseFloat(avgRatingAgg[0].avg.toFixed(1))
          : null,
      },
      trendingSubjects,
      recentResources
    });
  } catch (error) {
    console.error('Public stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
