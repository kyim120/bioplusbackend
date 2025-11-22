const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, roleCheck } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

// All analytics routes require authentication
router.use(authenticate);

// Student analytics (accessible by students, admins, owners)
router.get('/student/:studentId?', analyticsController.getStudentAnalytics);

// System analytics (admin and owner only)
router.get('/system', roleCheck(['admin', 'owner']), analyticsController.getSystemAnalytics);

// Subject analytics
router.get('/subject/:subjectId', analyticsController.getSubjectAnalytics);

// User engagement analytics
router.get('/engagement', roleCheck(['admin', 'owner']), analyticsController.getUserEngagement);

// Update student analytics (internal use)
router.post('/student/:studentId/update', roleCheck(['admin', 'owner']), analyticsController.updateStudentAnalytics);

// Performance trends
router.get('/trends/:studentId', analyticsController.getPerformanceTrends);

// Leaderboard
router.get('/leaderboard', analyticsController.getLeaderboard);

// Content analytics
router.get('/content', roleCheck(['admin', 'owner']), analyticsController.getContentAnalytics);

// System health
router.get('/health', roleCheck(['admin', 'owner']), analyticsController.getSystemHealth);

// Export analytics
router.get('/export', roleCheck(['admin', 'owner']), analyticsController.exportAnalytics);

module.exports = router;
