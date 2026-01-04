const followRepository = require('../repositories/follow.repository');

/**
 * Follow a user and send notification
 */
const followUser = async (followerId, followingId) => {
    // Check if blocked
    const blocked = await followRepository.isBlocked(followerId, followingId);
    if (blocked) {
        throw new Error('Cannot follow this user');
    }

    const success = await followRepository.followUser(followerId, followingId);

    if (success) {
        // Create notification for the followed user
        await followRepository.createNotification({
            userId: followingId,
            type: 'follow',
            title: 'New Follower',
            body: 'Someone started following you',
            data: { followerId }
        });
    }

    return success;
};

/**
 * Unfollow a user
 */
const unfollowUser = async (followerId, followingId) => {
    return await followRepository.unfollowUser(followerId, followingId);
};

/**
 * Get followers list
 */
const getFollowers = async (userId, limit, offset) => {
    return await followRepository.getFollowers(userId, limit, offset);
};

/**
 * Get following list
 */
const getFollowing = async (userId, limit, offset) => {
    return await followRepository.getFollowing(userId, limit, offset);
};

/**
 * Check mutual follow
 */
const checkMutualFollow = async (user1, user2) => {
    return await followRepository.checkMutualFollow(user1, user2);
};

/**
 * Get follow status
 */
const getFollowStatus = async (currentUser, targetUser) => {
    return await followRepository.getFollowStatus(currentUser, targetUser);
};

/**
 * Get follow counts
 */
const getFollowCounts = async (userId) => {
    return await followRepository.getFollowCounts(userId);
};

/**
 * Block user
 */
const blockUser = async (blockerId, blockedId) => {
    return await followRepository.blockUser(blockerId, blockedId);
};

/**
 * Unblock user
 */
const unblockUser = async (blockerId, blockedId) => {
    return await followRepository.unblockUser(blockerId, blockedId);
};

/**
 * Get blocked users
 */
const getBlockedUsers = async (userId) => {
    return await followRepository.getBlockedUsers(userId);
};

/**
 * Check if blocked
 */
const isBlocked = async (user1, user2) => {
    return await followRepository.isBlocked(user1, user2);
};

/**
 * Get notifications
 */
const getNotifications = async (userId, limit, offset) => {
    return await followRepository.getNotifications(userId, limit, offset);
};

/**
 * Mark notification as read
 */
const markNotificationRead = async (notificationId, userId) => {
    return await followRepository.markNotificationRead(notificationId, userId);
};

/**
 * Get unread count
 */
const getUnreadCount = async (userId) => {
    return await followRepository.getUnreadCount(userId);
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    checkMutualFollow,
    getFollowStatus,
    getFollowCounts,
    blockUser,
    unblockUser,
    getBlockedUsers,
    isBlocked,
    getNotifications,
    markNotificationRead,
    getUnreadCount
};
