const followService = require('../services/follow.service');
const { sendSuccess, sendCreated, sendFail, sendError } = require('../utils/response');
const { SocketManager } = require('../sockets/socket.manager');
const SocketEvent = require('../sockets/socket.events');

// ==================== FOLLOW ====================

/**
 * Follow user
 * POST /api/v1/follow/:userId
 */
const followUser = async (req, res) => {
    try {
        const followerId = req.account?.account_id;
        const followingId = parseInt(req.params.userId);

        if (!followerId) {
            return sendFail(res, 'Invalid authentication token');
        }

        if (followerId === followingId) {
            return sendFail(res, 'Cannot follow yourself');
        }

        const success = await followService.followUser(followerId, followingId);

        if (success) {
            // Emit socket event to the user being followed
            SocketManager.emitToUser(followingId, SocketEvent.FOLLOW_UPDATE, {
                type: 'new_follower',
                followerId,
                followingId // Add logic for frontend to match
            });

            // Emit socket event to the follower (current user)
            SocketManager.emitToUser(followerId, SocketEvent.FOLLOW_UPDATE, {
                type: 'following_added',
                followingId
            });

            return sendCreated(res, 'Followed successfully');
        }

        return sendFail(res, 'Failed to follow user');
    } catch (error) {
        console.error('❌ FollowUser error:', error.message);
        return sendError(res, error.message || 'Server error');
    }
};

/**
 * Unfollow user
 * DELETE /api/v1/follow/:userId
 */
const unfollowUser = async (req, res) => {
    try {
        const followerId = req.account?.account_id;
        const followingId = parseInt(req.params.userId);

        if (!followerId) {
            return sendFail(res, 'Invalid authentication token');
        }

        const success = await followService.unfollowUser(followerId, followingId);

        if (success) {
            // Emit socket event to the user being unfollowed
            SocketManager.emitToUser(followingId, SocketEvent.FOLLOW_UPDATE, {
                type: 'lost_follower',
                followerId,
                followingId // Add logic for frontend to match
            });

            // Emit socket event to the unfollower (current user)
            SocketManager.emitToUser(followerId, SocketEvent.FOLLOW_UPDATE, {
                type: 'following_removed',
                followingId
            });

            return sendSuccess(res, 'Unfollowed successfully');
        }

        return sendFail(res, 'Failed to unfollow user');
    } catch (error) {
        console.error('❌ UnfollowUser error:', error.message);
        return sendError(res, 'Server error');
    }
};

/**
 * Get followers
 * GET /api/v1/follow/followers
 */
const getFollowers = async (req, res) => {
    try {
        const userId = req.account?.account_id;
        if (!userId) {
            return sendFail(res, 'Invalid authentication token');
        }

        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const followers = await followService.getFollowers(userId, limit, offset);
        return sendSuccess(res, 'Get followers successfully', followers);
    } catch (error) {
        console.error('❌ GetFollowers error:', error.message);
        return sendError(res, 'Server error');
    }
};

/**
 * Get following
 * GET /api/v1/follow/following
 */
const getFollowing = async (req, res) => {
    try {
        const userId = req.account?.account_id;
        if (!userId) {
            return sendFail(res, 'Invalid authentication token');
        }

        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const following = await followService.getFollowing(userId, limit, offset);
        return sendSuccess(res, 'Get following successfully', following);
    } catch (error) {
        console.error('❌ GetFollowing error:', error.message);
        return sendError(res, 'Server error');
    }
};

/**
 * Get follow status
 * GET /api/v1/follow/status/:userId
 */
const getFollowStatus = async (req, res) => {
    try {
        const currentUser = req.account?.account_id;
        const targetUser = parseInt(req.params.userId);

        if (!currentUser) {
            return sendFail(res, 'Invalid authentication token');
        }

        const status = await followService.getFollowStatus(currentUser, targetUser);
        const counts = await followService.getFollowCounts(targetUser);

        return sendSuccess(res, 'Get follow status successfully', {
            status,
            ...counts
        });
    } catch (error) {
        console.error('❌ GetFollowStatus error:', error.message);
        return sendError(res, 'Server error');
    }
};

/**
 * Get following IDs only (for caching)
 * GET /api/v1/follow/following/ids
 */
const getFollowingIds = async (req, res) => {
    try {
        const userId = req.account?.account_id;
        if (!userId) {
            return sendFail(res, 'Invalid authentication token');
        }

        const followingIds = await followService.getFollowingIds(userId);
        return sendSuccess(res, 'Get following IDs successfully', { followingIds });
    } catch (error) {
        console.error('❌ GetFollowingIds error:', error.message);
        return sendError(res, 'Server error');
    }
};

// ==================== BLOCK ====================

/**
 * Block user
 * POST /api/v1/block/:userId
 */
const blockUser = async (req, res) => {
    try {
        const blockerId = req.account?.account_id;
        const blockedId = parseInt(req.params.userId);

        if (!blockerId) {
            return sendFail(res, 'Invalid authentication token');
        }

        if (blockerId === blockedId) {
            return sendFail(res, 'Cannot block yourself');
        }

        const success = await followService.blockUser(blockerId, blockedId);

        if (success) {
            return sendCreated(res, 'Blocked successfully');
        }

        return sendFail(res, 'Failed to block user');
    } catch (error) {
        console.error('❌ BlockUser error:', error.message);
        return sendError(res, 'Server error');
    }
};

/**
 * Unblock user
 * DELETE /api/v1/block/:userId
 */
const unblockUser = async (req, res) => {
    try {
        const blockerId = req.account?.account_id;
        const blockedId = parseInt(req.params.userId);

        if (!blockerId) {
            return sendFail(res, 'Invalid authentication token');
        }

        const success = await followService.unblockUser(blockerId, blockedId);

        if (success) {
            return sendSuccess(res, 'Unblocked successfully');
        }

        return sendFail(res, 'Failed to unblock user');
    } catch (error) {
        console.error('❌ UnblockUser error:', error.message);
        return sendError(res, 'Server error');
    }
};

/**
 * Get blocked users
 * GET /api/v1/block/list
 */
const getBlockedUsers = async (req, res) => {
    try {
        const userId = req.account?.account_id;
        if (!userId) {
            return sendFail(res, 'Invalid authentication token');
        }

        const blockedUsers = await followService.getBlockedUsers(userId);
        return sendSuccess(res, 'Get blocked users successfully', blockedUsers);
    } catch (error) {
        console.error('❌ GetBlockedUsers error:', error.message);
        return sendError(res, 'Server error');
    }
};

// ==================== NOTIFICATIONS ====================

/**
 * Get notifications
 * GET /api/v1/notifications
 */
const getNotifications = async (req, res) => {
    try {
        const userId = req.account?.account_id;
        if (!userId) {
            return sendFail(res, 'Invalid authentication token');
        }

        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const notifications = await followService.getNotifications(userId, limit, offset);
        const unreadCount = await followService.getUnreadCount(userId);

        return sendSuccess(res, 'Get notifications successfully', {
            notifications,
            unread_count: unreadCount
        });
    } catch (error) {
        console.error('❌ GetNotifications error:', error.message);
        return sendError(res, 'Server error');
    }
};

/**
 * Mark notification as read
 * PUT /api/v1/notifications/:id/read
 */
const markNotificationRead = async (req, res) => {
    try {
        const userId = req.account?.account_id;
        const notificationId = parseInt(req.params.id);

        if (!userId) {
            return sendFail(res, 'Invalid authentication token');
        }

        const success = await followService.markNotificationRead(notificationId, userId);

        if (success) {
            return sendSuccess(res, 'Marked as read');
        }

        return sendFail(res, 'Failed to mark as read');
    } catch (error) {
        console.error('❌ MarkNotificationRead error:', error.message);
        return sendError(res, 'Server error');
    }
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFollowingIds,
    getFollowStatus,
    blockUser,
    unblockUser,
    getBlockedUsers,
    getNotifications,
    markNotificationRead
};
