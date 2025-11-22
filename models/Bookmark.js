const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['note', 'test', 'pastpaper', 'animation', 'book', 'chapter'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  },
  tags: [String],
  notes: String, // personal notes about the bookmark
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: String, // custom category for organization
  isActive: {
    type: Boolean,
    default: true
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

// Ensure unique bookmarks per student and resource
bookmarkSchema.index({ student: 1, type: 1, resourceId: 1 }, { unique: true });
bookmarkSchema.index({ student: 1, createdAt: -1 });
bookmarkSchema.index({ student: 1, type: 1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
