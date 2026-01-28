/**
 * FCM Token Repository
 * CRUD operations for FCM device tokens
 */

const db = require("../config/database");

/**
 * Save FCM token for a user (1 token per account)
 * Deletes all existing tokens for the user before saving the new one
 * @param {number} userId - User ID
 * @param {string} token - FCM token
 * @param {string} platform - Platform: android | ios | web
 * @param {string|null} deviceId - Optional device identifier
 */
const saveToken = async (userId, token, platform = "android", deviceId = null) => {
    const conn = await db;

    // First, delete all existing tokens for this user (1 token per account)
    await conn.execute(
        `DELETE FROM fcm_tokens WHERE user_id = ?`,
        [userId]
    );
    console.log(`🗑️ Deleted old FCM tokens for user ${userId}`);

    // Insert new token
    const query = `
    INSERT INTO fcm_tokens (user_id, fcm_token, platform, device_id, is_active)
    VALUES (?, ?, ?, ?, 1)
  `;

    const [result] = await conn.execute(query, [userId, token, platform, deviceId]);
    console.log(`📲 FCM token saved for user ${userId} (${platform}): ${token.substring(0, 20)}...`);
    return result;
};

/**
 * Get all active FCM tokens for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} List of token records
 */
const getTokensByUserId = async (userId) => {
    const conn = await db;

    const [rows] = await conn.execute(
        `SELECT fcm_token, platform, device_id FROM fcm_tokens 
     WHERE user_id = ? AND is_active = 1`,
        [userId]
    );

    return rows;
};

/**
 * Get tokens for multiple users
 * @param {number[]} userIds - Array of user IDs
 * @returns {Promise<Array>} List of token records with user_id
 */
const getTokensByUserIds = async (userIds) => {
    if (!userIds || userIds.length === 0) return [];

    const conn = await db;
    const placeholders = userIds.map(() => "?").join(",");

    const [rows] = await conn.execute(
        `SELECT user_id, fcm_token, platform FROM fcm_tokens 
     WHERE user_id IN (${placeholders}) AND is_active = 1`,
        userIds
    );

    return rows;
};

/**
 * Delete/deactivate a specific token
 * @param {string} token - FCM token to delete
 */
const deleteToken = async (token) => {
    const conn = await db;

    // Soft delete by marking inactive
    const [result] = await conn.execute(
        `UPDATE fcm_tokens SET is_active = 0 WHERE fcm_token = ?`,
        [token]
    );

    console.log(`🗑️ FCM token deactivated: ${token.substring(0, 20)}...`);
    return result.affectedRows > 0;
};

/**
 * Delete all tokens for a user (on logout)
 * @param {number} userId - User ID
 */
const deleteUserTokens = async (userId) => {
    const conn = await db;

    const [result] = await conn.execute(
        `UPDATE fcm_tokens SET is_active = 0 WHERE user_id = ?`,
        [userId]
    );

    console.log(`🗑️ All FCM tokens deactivated for user ${userId}`);
    return result.affectedRows;
};

/**
 * Cleanup invalid tokens (called when FCM returns error)
 * @param {string[]} invalidTokens - Array of invalid tokens
 */
const cleanupInvalidTokens = async (invalidTokens) => {
    if (!invalidTokens || invalidTokens.length === 0) return 0;

    const conn = await db;
    const placeholders = invalidTokens.map(() => "?").join(",");

    const [result] = await conn.execute(
        `DELETE FROM fcm_tokens WHERE fcm_token IN (${placeholders})`,
        invalidTokens
    );

    console.log(`🧹 Cleaned up ${result.affectedRows} invalid FCM tokens`);
    return result.affectedRows;
};

module.exports = {
    saveToken,
    getTokensByUserId,
    getTokensByUserIds,
    deleteToken,
    deleteUserTokens,
    cleanupInvalidTokens,
};
