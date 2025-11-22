const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

// Stats routes
router.get('/stats', profileController.getStats);
router.put('/stats', profileController.updateStats);

// Achievement routes
router.post('/achievements', profileController.addAchievement);

module.exports = router;
