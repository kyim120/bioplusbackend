const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  chapterNumber: {
    type: Number,
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
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  learningObjectives: [String],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  estimatedHours: {
    type: Number,
    default: 2
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  resources: {
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
    tests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
    animations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Animation' }],
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
  },
  stats: {
    totalNotes: { type: Number, default: 0 },
    totalTests: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
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

chapterSchema.index({ subject: 1, chapterNumber: 1 });
chapterSchema.index({ grade: 1, isActive: 1 });

module.exports = mongoose.model('Chapter', chapterSchema);
