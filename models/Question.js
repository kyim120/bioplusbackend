const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswerIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  subject: String,
  chapter: String,
  grade: String,
  topic: String,
  marks: {
    type: Number,
    default: 1
  },
  negativeMarking: {
    type: Number,
    default: 0
  },
  tags: [String],
  imageUrl: String,
  importSource: {
    type: String,
    enum: ['manual', 'xml', 'api'],
    default: 'manual'
  },
  importBatchId: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'reported'],
    default: 'active'
  },
  stats: {
    timesUsed: { type: Number, default: 0 },
    correctAttempts: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 },
    averageTimeSpent: { type: Number, default: 0 }
  },
  createdBy: {
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

questionSchema.index({ subject: 1, chapter: 1, status: 1 });
questionSchema.index({ grade: 1, difficulty: 1 });
questionSchema.index({ importBatchId: 1 });
questionSchema.index({ question: 'text' });

module.exports = mongoose.model('Question', questionSchema);
