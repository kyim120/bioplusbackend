const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { authenticate, roleCheck } = require('../middleware/auth');

// All routes require authentication and owner role
router.use(authenticate);
router.use(roleCheck(['owner']));

// Analytics
router.get('/analytics/system', ownerController.getSystemAnalytics);
router.get('/analytics/revenue', ownerController.getRevenueAnalytics);

// User Management
router.get('/users', ownerController.getUserManagement);
router.patch('/users/:userId/status', ownerController.updateUserStatus);
router.patch('/users/:userId/role', ownerController.updateUserRole);
router.delete('/users/:userId', ownerController.deleteUser);

// System Health
router.get('/system/health', ownerController.getSystemHealth);

// Content Management
router.get('/content', ownerController.getContentManagement);

module.exports = router;
