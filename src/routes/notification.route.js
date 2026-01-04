const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// ==================== NOTIFICATION ROUTES ====================

// Get notifications
router.get('/', followController.getNotifications);

// Mark notification as read
router.put('/:id/read', followController.markNotificationRead);

module.exports = router;
