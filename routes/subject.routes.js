const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { authenticate, roleCheck } = require('../middleware/auth');
const { validateSubject, validateChapter, handleValidationErrors } = require('../middleware/validation');

// Public routes (no auth required)
router.get('/', subjectController.getSubjects);
router.get('/:subjectId', subjectController.getSubject);

// Protected routes
router.use(authenticate);

// Student routes
router.get('/:subjectId/chapters', subjectController.getChaptersBySubject);
router.get('/:subjectId/progress', subjectController.getSubjectProgress);
router.get('/:subjectId/stats', subjectController.getSubjectStats);

// Admin/Owner routes
router.post('/', roleCheck(['admin', 'owner']), validateSubject, handleValidationErrors, subjectController.createSubject);
router.put('/:subjectId', roleCheck(['admin', 'owner']), validateSubject, handleValidationErrors, subjectController.updateSubject);
router.delete('/:subjectId', roleCheck(['admin', 'owner']), subjectController.deleteSubject);

// Chapter routes
router.get('/chapters/:chapterId', subjectController.getChapter);
router.get('/chapters', subjectController.getChapters);

router.post('/:subjectId/chapters', roleCheck(['admin', 'owner']), validateChapter, handleValidationErrors, subjectController.createChapter);
router.put('/chapters/:chapterId', roleCheck(['admin', 'owner']), validateChapter, handleValidationErrors, subjectController.updateChapter);
router.delete('/chapters/:chapterId', roleCheck(['admin', 'owner']), subjectController.deleteChapter);

// Order management
router.put('/order', roleCheck(['admin', 'owner']), subjectController.updateSubjectOrder);
router.put('/chapters/order', roleCheck(['admin', 'owner']), subjectController.updateChapterOrder);

module.exports = router;
