const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticate, roleCheck } = require('../middleware/auth');
const { validateBook, handleValidationErrors } = require('../middleware/validation');
const { uploadBook, handleMulterError } = require('../middleware/upload');

// Public routes
router.get('/', bookController.getBooks);
router.get('/popular', bookController.getPopularBooks);
router.get('/recent', bookController.getRecentBooks);
router.get('/search', bookController.searchBooks);

// Protected routes
router.use(authenticate);

// Get single book
router.get('/:bookId', bookController.getBook);

// Get book with chapters (full details)
router.get('/:bookId/full', bookController.getBookWithChapters);

// Student routes
router.get('/:bookId/progress', bookController.getReadingProgress);
router.post('/:bookId/progress', bookController.markAsRead);
router.post('/:bookId/rate', bookController.rateBook);
router.post('/:bookId/like', bookController.toggleLike);

// Subject-specific routes
router.get('/subject/:subjectId', bookController.getBooksBySubject);

// Category routes
router.get('/category/:category', bookController.getBooksByCategory);

// Admin/Owner routes
router.post('/', roleCheck(['admin', 'owner']), uploadBook.single('file'), handleMulterError, validateBook, handleValidationErrors, bookController.createBook);
router.put('/:bookId', roleCheck(['admin', 'owner']), validateBook, handleValidationErrors, bookController.updateBook);
router.delete('/:bookId', roleCheck(['admin', 'owner']), bookController.deleteBook);

module.exports = router;
