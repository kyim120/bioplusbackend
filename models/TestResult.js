const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    selectedAnswer: Number,
    isCorrect: Boolean,
    marksAwarded: Number,
    timeSpent: Number // in seconds
  }],
  score: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'passed', 'failed', 'incomplete'],
    default: 'completed'
  },
  startedAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  feedback: {
    strengths: [String],
    weaknesses: [String],
    recommendations: [String]
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceType: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

testResultSchema.index({ test: 1, student: 1 });
testResultSchema.index({ student: 1, createdAt: -1 });
testResultSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('TestResult', testResultSchema);
