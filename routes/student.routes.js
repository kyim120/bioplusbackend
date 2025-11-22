const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, roleCheck } = require('../middleware/auth');

// All routes require authentication and student role
router.use(authenticate);
router.use(roleCheck(['student']));

// Dashboard
router.get('/dashboard', studentController.getDashboard);

// Subjects & Chapters
router.get('/subjects', studentController.getSubjects);
router.get('/subjects/:subjectId/chapters', studentController.getChapters);

// Notes
router.get('/notes', studentController.getNotes);
router.get('/notes/:noteId', studentController.getNote);

// Tests
router.get('/tests', studentController.getTests);
router.get('/tests/:testId', studentController.getTest);
router.post('/tests/submit', studentController.submitTest);
router.get('/test-results', studentController.getTestResults);
router.get('/test-results/:resultId', studentController.getTestResult);

// Past Papers
router.get('/past-papers', studentController.getPastPapers);

// Animations
router.get('/animations', studentController.getAnimations);

// Books
router.get('/books', studentController.getBooks);

// Bookmarks
router.get('/bookmarks', studentController.getBookmarks);
router.post('/bookmarks', studentController.addBookmark);
router.delete('/bookmarks/:bookmarkId', studentController.deleteBookmark);

// Progress
router.get('/progress', studentController.getProgress);
router.post('/progress', studentController.updateProgress);

// Analytics
router.get('/analytics', studentController.getAnalytics);

// Enrollments
router.get('/enrollments', studentController.getEnrollments);
router.post('/enroll', studentController.enrollInBook);
router.put('/enrollments/:enrollmentId/progress', studentController.updateEnrollmentProgress);
router.delete('/enrollments/:enrollmentId', studentController.unenrollFromBook);
router.post('/enrollments/:enrollmentId/rate', studentController.rateEnrolledBook);

module.exports = router;
