/**
 * Push Payload Builder
 * Build FCM notification payloads by type - no business logic here
 */

const { PUSH_TYPE } = require("./push.type");

/**
 * Build FCM payload based on notification type
 * @param {string} type - Push type from PUSH_TYPE enum
 * @param {object} data - Raw data for building payload
 * @returns {object} FCM-ready payload with notification and data
 */
const buildPush = (type, data) => {
    switch (type) {
        case PUSH_TYPE.CHAT:
            return buildChatPush(data);

        case PUSH_TYPE.FOLLOW:
            return buildFollowPush(data);

        case PUSH_TYPE.ORDER:
            return buildOrderPush(data);

        case PUSH_TYPE.SYSTEM:
            return buildSystemPush(data);

        case PUSH_TYPE.CALL:
            return buildCallPush(data);

        default:
            console.warn(`⚠️ Unknown push type: ${type}`);
            return buildDefaultPush(data);
    }
};

// =============== CHAT ===============
const buildChatPush = (data) => ({
    notification: {
        title: data.senderName || "New Message",
        body: truncateText(data.content, 100),
    },
    data: {
        type: PUSH_TYPE.CHAT,
        chatId: String(data.conversationId || ""),
        senderId: String(data.senderId || ""),
        senderName: String(data.senderName || ""),
        senderAvatar: String(data.senderAvatar || ""),
        messageId: String(data.messageId || ""),
        timestamp: new Date().toISOString(),
    },
});

// =============== FOLLOW ===============
const buildFollowPush = (data) => ({
    notification: {
        title: "New Follower",
        body: `${data.followerName || "Someone"} started following you`,
    },
    data: {
        type: PUSH_TYPE.FOLLOW,
        followerId: String(data.followerId || ""),
        followerName: String(data.followerName || ""),
        timestamp: new Date().toISOString(),
    },
});

// =============== ORDER ===============
const buildOrderPush = (data) => ({
    notification: {
        title: data.title || "Order Update",
        body: data.body || "Your order has been updated",
    },
    data: {
        type: PUSH_TYPE.ORDER,
        orderId: String(data.orderId || ""),
        status: String(data.status || ""),
        timestamp: new Date().toISOString(),
    },
});

// =============== SYSTEM ===============
const buildSystemPush = (data) => ({
    notification: {
        title: data.title || "Drilly",
        body: data.body || "You have a new notification",
    },
    data: {
        type: PUSH_TYPE.SYSTEM,
        action: String(data.action || ""),
        payload: JSON.stringify(data.payload || {}),
        timestamp: new Date().toISOString(),
    },
});

// =============== CALL ===============
const buildCallPush = (data) => ({
    // ⚠️ CRITICAL: No notification block for calls.
    // This forces "data-only" message so app can handle it in background
    // and show full-screen intent / custom notification.
    data: {
        type: PUSH_TYPE.CALL,
        callerId: String(data.callerId || ""),
        callerName: String(data.callerName || ""),
        callerAvatar: String(data.callerAvatar || ""),
        isVideo: String(data.isVideo || false),
        channelId: String(data.channelId || ""),
        title: data.callerName || "Incoming Call", // Pass title/body in data for local build
        body: data.isVideo ? "Video Call" : "Audio Call",
        timestamp: new Date().toISOString(),
    },
});

// =============== DEFAULT ===============
const buildDefaultPush = (data) => ({
    notification: {
        title: data.title || "Drilly",
        body: data.body || "You have a new notification",
    },
    data: {
        type: "default",
        ...Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v)])
        ),
        timestamp: new Date().toISOString(),
    },
});

// =============== HELPERS ===============
const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
};

module.exports = {
    buildPush,
    // Export individual builders for direct use if needed
    buildChatPush,
    buildFollowPush,
    buildOrderPush,
    buildSystemPush,
    buildCallPush,
};
