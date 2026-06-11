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

    res.json({
      success: true,
      stats: {
        totalResources,
        totalUsers,
        totalDownloads: totalDownloadsAgg[0]?.total || 0,
        averageRating: avgRatingAgg[0]?.avg
          ? parseFloat(avgRatingAgg[0].avg.toFixed(1))
          : null,
      }
    });
  } catch (error) {
    console.error('Public stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
