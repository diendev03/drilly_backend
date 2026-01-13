const followRepo = require("../repositories/follow.repository");
const profileRepo = require("../repositories/profile.repository"); // To get names/avatars for notifications

/**
 * Follow a user
 */
const followUser = async (followerId, followingId) => {
    // 1. Check if blocked
    const isBlocked = await followRepo.isBlocked(followingId, followerId);
    // If target blocked me, I cannot follow? Or if I blocked target?
    // Usually if I blocked target, I should unblock first? Or just fail?
    // If target blocked me, I strictly cannot follow.
    if (isBlocked) {
        throw new Error("Cannot follow this user (blocked)");
    }

    // 2. Perform follow
    const success = await followRepo.followUser(followerId, followingId);
    if (!success) return false; // Maybe already following

    // 3. Create Notification
    try {
        const followerProfile = await profileRepo.getProfile(followerId);
        if (followerProfile) {
            await followRepo.createNotification({
                userId: followingId,
                type: 'new_follower',
                title: 'New Follower',
                body: `${followerProfile.name} started following you.`,
                data: {
                    followerId,
                    followerName: followerProfile.name,
                    followerAvatar: followerProfile.avatar
                }
            });
        }
    } catch (e) {
        console.error("Failed to create notification on follow:", e);
        // Don't fail the request just because notification failed
    }

    return true;
};

/**
 * Unfollow a user
 */
const unfollowUser = async (followerId, followingId) => {
    return await followRepo.unfollowUser(followerId, followingId);
};

/**
 * Get followers
 */
const getFollowers = async (userId, limit, offset) => {
    return await followRepo.getFollowers(userId, limit, offset);
};

/**
 * Get following
 */
const getFollowing = async (userId, limit, offset) => {
    return await followRepo.getFollowing(userId, limit, offset);
};

/**
 * Get follow status and counts
 */
const getFollowStatus = async (currentUser, targetUser) => {
    return await followRepo.getFollowStatus(currentUser, targetUser);
};

const getFollowCounts = async (userId) => {
    return await followRepo.getFollowCounts(userId);
};

/**
 * Block user
 */
const blockUser = async (blockerId, blockedId) => {
    return await followRepo.blockUser(blockerId, blockedId);
};

/**
 * Unblock user
 */
const unblockUser = async (blockerId, blockedId) => {
    return await followRepo.unblockUser(blockerId, blockedId);
};

/**
 * Get blocked users
 */
const getBlockedUsers = async (userId) => {
    return await followRepo.getBlockedUsers(userId);
};

/**
 * Notifications
 */
const getNotifications = async (userId, limit, offset) => {
    return await followRepo.getNotifications(userId, limit, offset);
};

const getUnreadCount = async (userId) => {
    return await followRepo.getUnreadCount(userId);
};

const markNotificationRead = async (notificationId, userId) => {
    return await followRepo.markNotificationRead(notificationId, userId);
};

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFollowStatus,
    getFollowCounts,
    blockUser,
    unblockUser,
    getBlockedUsers,
    getNotifications,
    getUnreadCount,
    markNotificationRead
};
