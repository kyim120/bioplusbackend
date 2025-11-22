const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

router.post('/recommendations', authenticate, aiController.getStudyRecommendations);
router.post('/explain', authenticate, aiController.explainConcept);
router.post('/generate-quiz', authenticate, aiController.generateQuizQuestions);
router.post('/analyze-performance', authenticate, aiController.analyzePerformance);

module.exports = router;
