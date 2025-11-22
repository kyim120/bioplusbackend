const mongoose = require('mongoose');

const pastPaperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: new Date().getFullYear() + 1
  },
  term: {
    type: String,
    enum: ['January', 'June', 'November', 'Mid-year', 'End-year'],
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  grade: {
    type: String,
    required: true,
    enum: ['9', '10', '11', '12']
  },
  paperType: {
    type: String,
    enum: ['Paper 1', 'Paper 2', 'Paper 3', 'Combined'],
    default: 'Paper 1'
  },
  variant: {
    type: String,
    enum: ['1', '2', '3'],
    default: '1'
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  fileSize: Number, // in bytes
  pages: Number,
  duration: Number, // estimated time in minutes
  totalMarks: Number,
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  tags: [String],
  description: String,
  markingScheme: {
    fileUrl: String,
    isAvailable: { type: Boolean, default: false }
  },
  stats: {
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] }
  },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    createdAt: { type: Date, default: Date.now }
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

pastPaperSchema.index({ subject: 1, grade: 1, year: -1, isActive: 1 });
pastPaperSchema.index({ year: -1, term: 1 });
pastPaperSchema.index({ title: 'text' });

module.exports = mongoose.model('PastPaper', pastPaperSchema);
