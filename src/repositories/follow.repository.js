const dbPromise = require('../config/database');

const getConnection = async () => {
    return await dbPromise;
};

// ==================== FOLLOW ====================

/**
 * Follow user
 */
const followUser = async (followerId, followingId) => {
    const db = await getConnection();
    const [result] = await db.execute(
        `INSERT INTO user_follow (follower_id, following_id, created_at)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE id = id`,
        [followerId, followingId]
    );
    return result.affectedRows > 0;
};

/**
 * Unfollow user
 */
const unfollowUser = async (followerId, followingId) => {
    const db = await getConnection();
    const [result] = await db.execute(
        `DELETE FROM user_follow WHERE follower_id = ? AND following_id = ?`,
        [followerId, followingId]
    );
    return result.affectedRows > 0;
};

/**
 * Get followers list
 */
const getFollowers = async (userId, limit = 50, offset = 0) => {
    const db = await getConnection();
    const [rows] = await db.execute(
        `SELECT p.account_id, p.name, p.avatar, uf.created_at AS followed_at,
            CASE WHEN uf2.id IS NOT NULL THEN 1 ELSE 0 END AS is_following_back
     FROM user_follow uf
     JOIN profile p ON uf.follower_id = p.account_id
     LEFT JOIN user_follow uf2 ON uf2.follower_id = ? AND uf2.following_id = uf.follower_id
     WHERE uf.following_id = ?
     ORDER BY uf.created_at DESC
     LIMIT ? OFFSET ?`,
        [userId, userId, limit, offset]
    );
    return rows;
};

/**
 * Get following list
 */
const getFollowing = async (userId, limit = 50, offset = 0) => {
    const db = await getConnection();
    const [rows] = await db.execute(
        `SELECT p.account_id, p.name, p.avatar, uf.created_at AS followed_at,
            CASE WHEN uf2.id IS NOT NULL THEN 1 ELSE 0 END AS is_following_back
     FROM user_follow uf
     JOIN profile p ON uf.following_id = p.account_id
     LEFT JOIN user_follow uf2 ON uf2.follower_id = uf.following_id AND uf2.following_id = ?
     WHERE uf.follower_id = ?
     ORDER BY uf.created_at DESC
     LIMIT ? OFFSET ?`,
        [userId, userId, limit, offset]
    );
    return rows;
};

/**
 * Check if both users follow each other (mutual follow)
 */
const checkMutualFollow = async (user1, user2) => {
    const db = await getConnection();
    const [rows] = await db.execute(
        `SELECT COUNT(*) as count FROM user_follow
     WHERE (follower_id = ? AND following_id = ?)
        OR (follower_id = ? AND following_id = ?)`,
        [user1, user2, user2, user1]
    );
    return rows[0].count >= 2;
};

/**
 * Get follow status between two users
 * Returns: 'none', 'following', 'followed', 'mutual'
 */
const getFollowStatus = async (currentUser, targetUser) => {
    const db = await getConnection();
    const [rows] = await db.execute(
        `SELECT 
       (SELECT COUNT(*) FROM user_follow WHERE follower_id = ? AND following_id = ?) AS is_following,
       (SELECT COUNT(*) FROM user_follow WHERE follower_id = ? AND following_id = ?) AS is_followed`,
        [currentUser, targetUser, targetUser, currentUser]
    );

    const { is_following, is_followed } = rows[0];
    if (is_following && is_followed) return 'mutual';
    if (is_following) return 'following';
    if (is_followed) return 'followed';
    return 'none';
};

/**
 * Get follow counts
 */
const getFollowCounts = async (userId) => {
    const db = await getConnection();
    const [rows] = await db.execute(
        `SELECT 
       (SELECT COUNT(*) FROM user_follow WHERE following_id = ?) AS followers_count,
       (SELECT COUNT(*) FROM user_follow WHERE follower_id = ?) AS following_count`,
        [userId, userId]
    );
    return rows[0];
};

// ==================== BLOCK ====================

/**
 * Block user - also removes any follow relationships
 */
const blockUser = async (blockerId, blockedId) => {
    const db = await getConnection();

    // Start transaction
    await db.beginTransaction();
    try {
        // Remove follow relationships both ways
        await db.execute(
            `DELETE FROM user_follow WHERE 
       (follower_id = ? AND following_id = ?) OR 
       (follower_id = ? AND following_id = ?)`,
            [blockerId, blockedId, blockedId, blockerId]
        );

        // Add block record
        await db.execute(
            `INSERT INTO user_block (blocker_id, blocked_id, created_at)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE id = id`,
            [blockerId, blockedId]
        );

        await db.commit();
        return true;
    } catch (error) {
        await db.rollback();
        throw error;
    }
};

/**
 * Unblock user
 */
const unblockUser = async (blockerId, blockedId) => {
    const db = await getConnection();
    const [result] = await db.execute(
        `DELETE FROM user_block WHERE blocker_id = ? AND blocked_id = ?`,
        [blockerId, blockedId]
    );
    return result.affectedRows > 0;
};

/**
 * Get blocked users list
 */
const getBlockedUsers = async (userId) => {
    const db = await getConnection();
    const [rows] = await db.execute(
        `SELECT p.account_id, p.name, p.avatar, ub.created_at AS blocked_at
     FROM user_block ub
     JOIN profile p ON ub.blocked_id = p.account_id
     WHERE ub.blocker_id = ?
     ORDER BY ub.created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Check if there's a block relationship (either direction)
 */
const isBlocked = async (user1, user2) => {
    const db = await getConnection();
    const [rows] = await db.execute(
        `SELECT COUNT(*) as count FROM user_block
     WHERE (blocker_id = ? AND blocked_id = ?)
        OR (blocker_id = ? AND blocked_id = ?)`,
        [user1, user2, user2, user1]
    );
    return rows[0].count > 0;
};

// ==================== NOTIFICATIONS ====================

/**
 * Create notification
 */
const createNotification = async ({ userId, type, title, body, data }) => {
    const db = await getConnection();
    const [result] = await db.execute(
        `INSERT INTO notifications (user_id, type, title, body, data, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
        [userId, type, title, body, JSON.stringify(data || {})]
    );
    return { id: result.insertId, userId, type, title, body, data };
};

/**
 * Get notifications for user
 */
const getNotifications = async (userId, limit = 20, offset = 0) => {
    const db = await getConnection();
    const [rows] = await db.execute(
        `SELECT * FROM notifications 
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
        [userId, limit, offset]
    );
    return rows.map(row => ({
        ...row,
        data: row.data ? JSON.parse(row.data) : {}
    }));
};

/**
 * Mark notification as read
 */
const markNotificationRead = async (notificationId, userId) => {
    const db = await getConnection();
    const [result] = await db.execute(
        `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
    );
    return result.affectedRows > 0;
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (userId) => {
    const db = await getConnection();
    const [rows] = await db.execute(
        `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
        [userId]
    );
    return rows[0].count;
};

module.exports = {
    // Follow
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    checkMutualFollow,
    getFollowStatus,
    getFollowCounts,
    // Block
    blockUser,
    unblockUser,
    getBlockedUsers,
    isBlocked,
    // Notifications
    createNotification,
    getNotifications,
    markNotificationRead,
    getUnreadCount
};
