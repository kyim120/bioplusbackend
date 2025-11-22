const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    sparse: true
  },
  description: String,
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  grade: {
    type: String,
    required: true,
    enum: ['9', '10', '11', '12']
  },
  bookType: {
    type: String,
    enum: ['textbook', 'reference', 'workbook', 'guide'],
    default: 'textbook'
  },
  fileUrl: String,
  thumbnailUrl: String,
  pages: Number,
  edition: String,
  publicationYear: Number,
  publisher: String,
  language: {
    type: String,
    default: 'English'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFree: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0
  },
  tags: [String],
  tableOfContents: [{
    chapter: String,
    pageNumber: Number,
    subtopics: [String]
  }],
  stats: {
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 }
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

bookSchema.index({ subject: 1, grade: 1, isActive: 1 });
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ isbn: 1 });

module.exports = mongoose.model('Book', bookSchema);
