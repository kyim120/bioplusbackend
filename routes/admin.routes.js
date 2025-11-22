const express = require('express');
const router = express.Router();
const multer = require('multer');
const xmlImportController = require('../controllers/xmlImportController');
const adminController = require('../controllers/adminController');
const { authenticate, roleCheck } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/xml' || file.mimetype === 'application/xml') {
      cb(null, true);
    } else {
      cb(new Error('Only XML files allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// All routes require authentication and admin/owner role
router.use(authenticate);
router.use(roleCheck(['admin', 'owner']));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Users Management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

// Subjects Management
router.get('/subjects', adminController.getSubjects);
router.post('/subjects', adminController.createSubject);
router.put('/subjects/:subjectId', adminController.updateSubject);
router.delete('/subjects/:subjectId', adminController.deleteSubject);

// Notes Management
router.get('/notes', adminController.getNotes);
router.post('/notes', adminController.createNote);
router.put('/notes/:noteId', adminController.updateNote);
router.delete('/notes/:noteId', adminController.deleteNote);

// Tests Management
router.get('/tests', adminController.getTests);
router.post('/tests', adminController.createTest);
router.put('/tests/:testId', adminController.updateTest);
router.delete('/tests/:testId', adminController.deleteTest);

// Past Papers Management
router.get('/past-papers', adminController.getPastPapers);
router.post('/past-papers', adminController.createPastPaper);
router.put('/past-papers/:pastPaperId', adminController.updatePastPaper);
router.delete('/past-papers/:pastPaperId', adminController.deletePastPaper);

// Books Management
router.get('/books', adminController.getBooks);
router.post('/books', adminController.createBook);
router.put('/books/:bookId', adminController.updateBook);
router.delete('/books/:bookId', adminController.deleteBook);

// Chapters Management
router.get('/chapters', adminController.getChapters);
router.post('/chapters', adminController.createChapter);
router.put('/chapters/:chapterId', adminController.updateChapter);
router.delete('/chapters/:chapterId', adminController.deleteChapter);

// Animations Management
router.get('/animations', adminController.getAnimations);
router.post('/animations', adminController.createAnimation);
router.put('/animations/:animationId', adminController.updateAnimation);
router.delete('/animations/:animationId', adminController.deleteAnimation);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.post('/notifications', adminController.createNotification);
router.put('/notifications/:notificationId', adminController.updateNotification);
router.delete('/notifications/:notificationId', adminController.deleteNotification);

// Questions Import
router.post(
  '/questions/import-xml',
  upload.single('xmlFile'),
  xmlImportController.importMCQsFromXML
);

router.get(
  '/questions/import-history',
  xmlImportController.getImportHistory
);

router.get(
  '/questions/batch/:batchId',
  xmlImportController.getQuestionsByBatch
);

module.exports = router;
