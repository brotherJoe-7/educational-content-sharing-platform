const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    enum: ['Mathematics', 'English', 'Science', 'Social Studies', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Other']
  },
  gradeLevel: {
    type: String,
    required: [true, 'Please provide a grade level'],
    enum: ['Primary 1-3', 'Primary 4-6', 'JSS 1-3', 'SSS 1-3', 'University', 'Other']
  },
  author: {
    type: String,
    required: [true, 'Please provide the author name'],
    trim: true
  },
  licenseType: {
    type: String,
    required: [true, 'Please provide a license type'],
    enum: ['Creative Commons BY', 'Creative Commons BY-SA', 'Creative Commons BY-NC', 'OER', 'Public Domain', 'Other']
  },
  fileType: {
    type: String,
    required: [true, 'Please provide a file type'],
    enum: ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'Other']
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide a file URL']
  },
  cloudinaryPublicId: {
    type: String,
    required: false
  },
  fileName: {
    type: String,
    required: [true, 'Please provide a file name']
  },
  fileSize: {
    type: Number,
    required: [true, 'Please provide file size']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  auditTrail: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update average rating before saving
resourceSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.averageRating = sum / this.ratings.length;
  }
  this.updatedAt = Date.now();
  next();
});

// Add indexes for performance optimization
resourceSchema.index({ subject: 1 });
resourceSchema.index({ gradeLevel: 1 });
resourceSchema.index({ licenseType: 1 });
resourceSchema.index({ status: 1 });
resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ averageRating: -1 });
resourceSchema.index({ downloadCount: -1 });
resourceSchema.index({ subject: 1, gradeLevel: 1 });
resourceSchema.index({ subject: 1, status: 1 });
resourceSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
