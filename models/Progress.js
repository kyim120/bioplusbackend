const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['chapter', 'subject', 'note', 'test', 'animation', 'book'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'mastered'],
    default: 'not-started'
  },
  timeSpent: {
    type: Number,
    default: 0 // in minutes
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  masteredAt: Date,
  attempts: {
    type: Number,
    default: 0
  },
  bestScore: Number,
  notes: String, // personal notes about progress
  milestones: [{
    title: String,
    achieved: { type: Boolean, default: false },
    achievedAt: Date
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

// Ensure unique progress per student and resource
progressSchema.index({ student: 1, type: 1, resourceId: 1 }, { unique: true });
progressSchema.index({ student: 1, status: 1 });
progressSchema.index({ student: 1, lastAccessed: -1 });

module.exports = mongoose.model('Progress', progressSchema);
