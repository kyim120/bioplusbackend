const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: String,
  grade: {
    type: String,
    required: true,
    enum: ['9', '10', '11', '12']
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  icon: String,
  color: {
    type: String,
    default: '#3b82f6'
  },
  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  stats: {
    totalNotes: { type: Number, default: 0 },
    totalTests: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 }
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

subjectSchema.index({ grade: 1, isActive: 1 });
subjectSchema.index({ code: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
