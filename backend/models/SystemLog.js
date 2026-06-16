const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      // Auth actions
      'user_registered', 'user_login', 'user_login_failed', 'user_login_suspended',
      'user_logout',
      // Resource actions
      'resource_uploaded', 'resource_approved', 'resource_rejected',
      'resource_downloaded', 'resource_viewed', 'resource_rated', 'resource_deleted',
      // Admin actions
      'user_promoted', 'user_deleted', 'user_suspended', 'user_activated',
      'deleted_resource', 'file_replaced',
      // General
      'other'
    ]
  },
  details: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // For guest actions (not logged in)
  performedByName: { type: String },
  performedByEmail: { type: String },
  resourceTitle: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Index for fast queries
systemLogSchema.index({ createdAt: -1 });
systemLogSchema.index({ action: 1 });

module.exports = mongoose.model('SystemLog', systemLogSchema);
