const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// ==================== FOLLOW ROUTES ====================

// Follow user
router.post('/:userId', followController.followUser);

// Unfollow user
router.delete('/:userId', followController.unfollowUser);

// Get followers
router.get('/followers', followController.getFollowers);

// Get following
router.get('/following', followController.getFollowing);

// Get follow status
router.get('/status/:userId', followController.getFollowStatus);

module.exports = router;
