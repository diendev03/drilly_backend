/**
 * Push Dispatcher
 * Central router for all push notifications
 * All push notifications go through here
 */

const fcmService = require("../fcm/fcm.service");
const { buildPush } = require("./push.builder");

/**
 * Dispatch push notification to users
 * @param {string} type - Push type from PUSH_TYPE enum
 * @param {number|number[]} userIds - Single user ID or array of user IDs
 * @param {object} data - Data to build push payload
 * @returns {Promise<object>} Results summary
 */
const dispatch = async (type, userIds, data) => {
    try {
        // Normalize userIds to array
        const targetUserIds = Array.isArray(userIds) ? userIds : [userIds];

        // Filter out null/undefined
        const validUserIds = targetUserIds.filter((id) => id != null);

        if (validUserIds.length === 0) {
            console.log(`⚠️ Push dispatch: No valid user IDs provided`);
            return { sent: 0, failed: 0 };
        }

        // Build payload using builder
        const payload = buildPush(type, data);

        console.log(`📨 Push dispatch [${type}] to ${validUserIds.length} user(s)`);

        // Send via FCM service
        const result = await fcmService.sendToMultipleUsers(validUserIds, payload);

        return result;
    } catch (error) {
        console.error(`❌ Push dispatch error:`, error.message);
        return { sent: 0, failed: 0, error: error.message };
    }
};

/**
 * Dispatch to single user (convenience method)
 * @param {string} type - Push type
 * @param {number} userId - Target user ID
 * @param {object} data - Payload data
 */
const dispatchToUser = async (type, userId, data) => {
    return dispatch(type, [userId], data);
};

/**
 * Dispatch to multiple users excluding sender
 * Useful for chat where sender shouldn't receive push
 * @param {string} type - Push type
 * @param {number[]} userIds - All user IDs
 * @param {number} excludeUserId - User ID to exclude (sender)
 * @param {object} data - Payload data
 */
const dispatchExcluding = async (type, userIds, excludeUserId, data) => {
    const targetIds = userIds.filter((id) => id !== excludeUserId);
    return dispatch(type, targetIds, data);
};

module.exports = {
    dispatch,
    dispatchToUser,
    dispatchExcluding,
};
