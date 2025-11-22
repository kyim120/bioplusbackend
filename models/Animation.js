const mongoose = require('mongoose');

const animationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  },
  grade: {
    type: String,
    required: true,
    enum: ['9', '10', '11', '12']
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  duration: {
    type: Number, // in seconds
    required: true
  },
  transcript: String,
  tags: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  learningObjectives: [String],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animation'
  }],
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    completionRate: { type: Number, default: 0 }
  },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

animationSchema.index({ subject: 1, chapter: 1, isActive: 1 });
animationSchema.index({ grade: 1, isPublic: 1 });
animationSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Animation', animationSchema);
