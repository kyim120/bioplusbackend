const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User validation schemas
exports.validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name is required'),
  body('role')
    .optional()
    .isIn(['student', 'admin', 'owner'])
    .withMessage('Invalid role'),
  body('grade')
    .optional()
    .isIn(['9', '10', '11', '12'])
    .withMessage('Invalid grade')
];

exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Subject validation schemas
exports.validateSubject = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Subject name is required'),
  body('code')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Subject code is required'),
  body('grade')
    .isIn(['9', '10', '11', '12'])
    .withMessage('Invalid grade'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a positive integer')
];

// Chapter validation schemas
exports.validateChapter = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Chapter name is required'),
  body('chapterNumber')
    .isInt({ min: 1 })
    .withMessage('Chapter number must be a positive integer'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('learningObjectives')
    .optional()
    .isArray()
    .withMessage('Learning objectives must be an array'),
  body('learningObjectives.*')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Learning objective cannot be empty')
];

// Test validation schemas
exports.validateTest = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Test title is required'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('subject')
    .isMongoId()
    .withMessage('Valid subject ID is required'),
  body('chapter')
    .optional()
    .isMongoId()
    .withMessage('Invalid chapter ID'),
  body('grade')
    .isIn(['9', '10', '11', '12'])
    .withMessage('Invalid grade'),
  body('duration')
    .isInt({ min: 1, max: 180 })
    .withMessage('Duration must be between 1 and 180 minutes'),
  body('totalMarks')
    .isInt({ min: 1 })
    .withMessage('Total marks must be a positive integer'),
  body('passingMarks')
    .isInt({ min: 0 })
    .withMessage('Passing marks must be a non-negative integer'),
  body('instructions')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Instructions must be less than 2000 characters')
];

// Question validation schemas
exports.validateQuestion = [
  body('question')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Question text is required'),
  body('options')
    .isArray({ min: 2, max: 4 })
    .withMessage('Question must have 2-4 options'),
  body('options.*.text')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Option text cannot be empty'),
  body('correctAnswerIndex')
    .isInt({ min: 0, max: 3 })
    .withMessage('Correct answer index must be between 0 and 3'),
  body('explanation')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Explanation must be less than 1000 characters'),
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
  body('marks')
    .isInt({ min: 1 })
    .withMessage('Marks must be a positive integer'),
  body('negativeMarking')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Negative marking must be a non-negative number')
];

// Test submission validation
exports.validateTestSubmission = [
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  body('answers.*.questionId')
    .isMongoId()
    .withMessage('Valid question ID is required'),
  body('answers.*.selectedAnswer')
    .isInt({ min: 0, max: 3 })
    .withMessage('Selected answer must be between 0 and 3'),
  body('timeTaken')
    .isInt({ min: 0 })
    .withMessage('Time taken must be a non-negative integer')
];

// Note validation schemas
exports.validateNote = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Note title is required'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Note content is required'),
  body('subject')
    .isMongoId()
    .withMessage('Valid subject ID is required'),
  body('chapter')
    .optional()
    .isMongoId()
    .withMessage('Invalid chapter ID'),
  body('grade')
    .isIn(['9', '10', '11', '12'])
    .withMessage('Invalid grade'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

// Past paper validation schemas
exports.validatePastPaper = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Past paper title is required'),
  body('year')
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid year'),
  body('term')
    .isIn(['1', '2', '3', 'annual'])
    .withMessage('Invalid term'),
  body('subject')
    .isMongoId()
    .withMessage('Valid subject ID is required'),
  body('grade')
    .isIn(['9', '10', '11', '12'])
    .withMessage('Invalid grade'),
  body('fileUrl')
    .isURL()
    .withMessage('Valid file URL is required'),
  body('markingSchemeUrl')
    .optional()
    .isURL()
    .withMessage('Invalid marking scheme URL')
];

// Animation validation schemas
exports.validateAnimation = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Animation title is required'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('videoUrl')
    .isURL()
    .withMessage('Valid video URL is required'),
  body('transcript')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Transcript must be less than 10000 characters'),
  body('subject')
    .isMongoId()
    .withMessage('Valid subject ID is required'),
  body('chapter')
    .optional()
    .isMongoId()
    .withMessage('Invalid chapter ID'),
  body('grade')
    .isIn(['9', '10', '11', '12'])
    .withMessage('Invalid grade'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
];

// Book validation schemas
exports.validateBook = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Book title is required'),
  body('author')
    .isMongoId()
    .withMessage('Valid author ID is required'),
  body('subject')
    .isMongoId()
    .withMessage('Valid subject ID is required'),
  body('grade')
    .isIn(['9', '10', '11', '12'])
    .withMessage('Invalid grade'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('isbn')
    .optional()
    .isLength({ min: 10, max: 13 })
    .withMessage('ISBN must be 10 or 13 characters'),
  body('pages')
    .isInt({ min: 1 })
    .withMessage('Pages must be a positive integer'),
  body('category')
    .isIn(['textbook', 'reference', 'guide', 'workbook'])
    .withMessage('Invalid book category')
];

// Bookmark validation schemas
exports.validateBookmark = [
  body('type')
    .isIn(['note', 'animation', 'test', 'book', 'chapter'])
    .withMessage('Invalid bookmark type'),
  body('resourceId')
    .isMongoId()
    .withMessage('Valid resource ID is required'),
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Bookmark title is required'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority level'),
  body('category')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Category cannot be empty')
];

// Progress validation schemas
exports.validateProgress = [
  body('type')
    .isIn(['chapter', 'subject', 'note', 'test', 'animation', 'book'])
    .withMessage('Invalid progress type'),
  body('resourceId')
    .isMongoId()
    .withMessage('Valid resource ID is required'),
  body('progress')
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a non-negative integer')
];

// Parameter validation
exports.validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];
