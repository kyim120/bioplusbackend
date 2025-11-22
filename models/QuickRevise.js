const mongoose = require('mongoose');

const quickReviseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  hint: String,
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
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  stats: {
    timesReviewed: { type: Number, default: 0 },
    correctAttempts: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 } // in seconds
  },
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

quickReviseSchema.index({ subject: 1, chapter: 1, isActive: 1 });
quickReviseSchema.index({ grade: 1, difficulty: 1 });
quickReviseSchema.index({ question: 'text', answer: 'text' });

module.exports = mongoose.model('QuickRevise', quickReviseSchema);
