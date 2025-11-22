const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  avatar: String,
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      studyReminders: { type: Boolean, default: true }
    },
    studyGoals: {
      dailyHours: { type: Number, default: 2 },
      weeklyTests: { type: Number, default: 3 },
      targetGrade: String
    }
  },
  socialLinks: {
    linkedin: String,
    github: String,
    website: String
  },
  achievements: [{
    title: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
    icon: String
  }],
  stats: {
    totalStudyTime: { type: Number, default: 0 }, // in minutes
    testsCompleted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    favoriteSubject: String
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

profileSchema.index({ user: 1 });

module.exports = mongoose.model('Profile', profileSchema);
