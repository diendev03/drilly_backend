/**
 * FCM Controller
 * API endpoints for FCM token management
 */

const fcmTokenRepo = require("../fcm/fcm.token.repo");
const { sendSuccess, sendFail, sendError } = require("../utils/response");
const { PLATFORM } = require("../fcm/fcm.constant");

/**
 * POST /api/v1/fcm/token
 * Register or update FCM token for current user
 */
const registerToken = async (req, res) => {
    try {
        const userId = req.account?.account_id;
        if (!userId) {
            return sendFail(res, "Authentication required");
        }

        const { token, platform, device_id } = req.body;

        if (!token) {
            return sendFail(res, "FCM token is required");
        }

        // Validate platform
        const validPlatform = Object.values(PLATFORM).includes(platform)
            ? platform
            : PLATFORM.ANDROID;

        await fcmTokenRepo.saveToken(userId, token, validPlatform, device_id || null);

        console.log(`📲 FCM Token Registered: user_id=${userId}, token=${token.substring(0, 30)}..., platform=${validPlatform}`);

        return sendSuccess(res, "FCM token registered successfully", {
            user_id: userId,
            platform: validPlatform,
        });
    } catch (error) {
        console.error("❌ FCM registerToken error:", error);
        return sendError(res, "Failed to register FCM token");
    }
};

/**
 * DELETE /api/v1/fcm/token
 * Unregister FCM token (on logout or token refresh)
 */
const unregisterToken = async (req, res) => {
    try {
        const userId = req.account?.account_id;
        if (!userId) {
            return sendFail(res, "Authentication required");
        }

        const { token } = req.body;

        if (token) {
            // Delete specific token
            await fcmTokenRepo.deleteToken(token);
        } else {
            // Delete all tokens for user (full logout)
            await fcmTokenRepo.deleteUserTokens(userId);
        }

        return sendSuccess(res, "FCM token unregistered successfully");
    } catch (error) {
        console.error("❌ FCM unregisterToken error:", error);
        return sendError(res, "Failed to unregister FCM token");
    }
};

/**
 * DELETE /api/v1/fcm/tokens
 * Unregister all FCM tokens for current user (logout from all devices)
 */
const unregisterAllTokens = async (req, res) => {
    try {
        const userId = req.account?.account_id;
        if (!userId) {
            return sendFail(res, "Authentication required");
        }

        const count = await fcmTokenRepo.deleteUserTokens(userId);

        return sendSuccess(res, "All FCM tokens unregistered", {
            deleted_count: count,
        });
    } catch (error) {
        console.error("❌ FCM unregisterAllTokens error:", error);
        return sendError(res, "Failed to unregister FCM tokens");
    }
};

module.exports = {
    registerToken,
    unregisterToken,
    unregisterAllTokens,
};
