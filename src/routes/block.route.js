const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// ==================== BLOCK ROUTES ====================

// Block user
router.post('/:userId', followController.blockUser);

// Unblock user
router.delete('/:userId', followController.unblockUser);

// Get blocked users list
router.get('/list', followController.getBlockedUsers);

module.exports = router;
