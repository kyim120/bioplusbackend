const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  metrics: {
    testsAttempted: { type: Number, default: 0 },
    testsCompleted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 },
    chaptersCompleted: { type: Number, default: 0 },
    notesViewed: { type: Number, default: 0 },
    videosWatched: { type: Number, default: 0 },
    questionsAnswered: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    streak: { type: Number, default: 0 }
  },
  subjectPerformance: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    score: Number,
    testsCompleted: Number,
    timeSpent: Number
  }],
  weakTopics: [{
    topic: String,
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    accuracy: Number
  }],
  strongTopics: [{
    topic: String,
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    accuracy: Number
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

analyticsSchema.index({ student: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
