/**
 * FCM Service
 * Firebase Cloud Messaging - Send push notifications
 */

const admin = require("firebase-admin");
const path = require("path");
const fcmTokenRepo = require("./fcm.token.repo");
const { FCM_TTL, PRIORITY, ANDROID_CHANNEL } = require("./fcm.constant");

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, "../config/serviceAccountKey.json");

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath)),
        });
        console.log("🔥 Firebase Admin SDK initialized");
    } catch (error) {
        console.error("❌ Firebase Admin SDK initialization failed:", error.message);
    }
}

/**
 * Send notification to a single device token
 * @param {string} token - FCM device token
 * @param {object} payload - Notification payload
 * @returns {Promise<object>} FCM response
 */
const sendToDevice = async (token, payload) => {
    if (!token || !payload) {
        console.warn("⚠️ sendToDevice: Missing token or payload");
        return null;
    }

    const message = {
        token,
        notification: payload.notification,
        data: payload.data || {},
        android: {
            priority: PRIORITY.HIGH,
            ttl: FCM_TTL * 1000, // milliseconds
            notification: {
                channelId: ANDROID_CHANNEL.CHAT.id,
                sound: "default",
            },
        },
        apns: {
            payload: {
                aps: {
                    sound: "default",
                    badge: 1,
                },
            },
        },
    };

    try {
        const response = await admin.messaging().send(message);
        console.log(`✅ FCM sent to device: ${token.substring(0, 20)}...`);
        return { success: true, response };
    } catch (error) {
        console.error(`❌ FCM send failed: ${error.message}`);

        // Handle invalid token - cleanup
        if (
            error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered"
        ) {
            await fcmTokenRepo.deleteToken(token);
        }

        return { success: false, error: error.message };
    }
};

/**
 * Send notification to all devices of a user
 * @param {number} userId - Target user ID
 * @param {object} payload - Notification payload
 * @returns {Promise<object>} Results summary
 */
const sendToUser = async (userId, payload) => {
    const tokens = await fcmTokenRepo.getTokensByUserId(userId);

    if (!tokens || tokens.length === 0) {
        console.log(`⚠️ No FCM tokens found for user ${userId}`);
        return { sent: 0, failed: 0 };
    }

    const results = await Promise.all(
        tokens.map((t) => sendToDevice(t.fcm_token, payload))
    );

    const sent = results.filter((r) => r?.success).length;
    const failed = results.filter((r) => !r?.success).length;

    console.log(`📤 FCM to user ${userId}: ${sent} sent, ${failed} failed`);
    return { sent, failed };
};

/**
 * Send notification to multiple users
 * @param {number[]} userIds - Array of user IDs
 * @param {object} payload - Notification payload
 * @returns {Promise<object>} Results summary
 */
const sendToMultipleUsers = async (userIds, payload) => {
    if (!userIds || userIds.length === 0) {
        return { sent: 0, failed: 0 };
    }

    const tokens = await fcmTokenRepo.getTokensByUserIds(userIds);

    if (!tokens || tokens.length === 0) {
        console.log(`⚠️ No FCM tokens found for users: ${userIds.join(", ")}`);
        return { sent: 0, failed: 0 };
    }

    console.log(`🔑 Found ${tokens.length} FCM tokens for users ${userIds.join(",")}: ${tokens.map(t => `user_id=${t.user_id}`).join(", ")}`);

    const results = await Promise.all(
        tokens.map((t) => sendToDevice(t.fcm_token, payload))
    );

    const sent = results.filter((r) => r?.success).length;
    const failed = results.filter((r) => !r?.success).length;

    console.log(`📤 FCM to ${userIds.length} users: ${sent} sent, ${failed} failed`);
    return { sent, failed };
};

/**
 * Send to multiple tokens directly (for batch operations)
 * @param {string[]} tokens - Array of FCM tokens
 * @param {object} payload - Notification payload
 */
const sendToTokens = async (tokens, payload) => {
    if (!tokens || tokens.length === 0) return { sent: 0, failed: 0 };

    const message = {
        notification: payload.notification,
        data: payload.data || {},
        android: {
            priority: PRIORITY.HIGH,
            notification: {
                channelId: ANDROID_CHANNEL.CHAT.id,
                sound: "default",
            },
        },
        apns: {
            payload: {
                aps: {
                    sound: "default",
                    badge: 1,
                },
            },
        },
        tokens,
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);

        // Cleanup failed tokens
        const failedTokens = [];
        response.responses.forEach((res, idx) => {
            if (!res.success && res.error?.code?.includes("registration-token")) {
                failedTokens.push(tokens[idx]);
            }
        });

        if (failedTokens.length > 0) {
            await fcmTokenRepo.cleanupInvalidTokens(failedTokens);
        }

        console.log(`📤 FCM multicast: ${response.successCount} sent, ${response.failureCount} failed`);
        return { sent: response.successCount, failed: response.failureCount };
    } catch (error) {
        console.error(`❌ FCM multicast failed: ${error.message}`);
        return { sent: 0, failed: tokens.length };
    }
};

module.exports = {
    sendToDevice,
    sendToUser,
    sendToMultipleUsers,
    sendToTokens,
};
