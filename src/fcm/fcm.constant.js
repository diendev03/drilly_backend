/**
 * FCM Constants
 * Configuration and constants for Firebase Cloud Messaging
 */

module.exports = {
    // FCM message time-to-live in seconds (24 hours)
    FCM_TTL: 86400,

    // Platform identifiers
    PLATFORM: {
        ANDROID: "android",
        IOS: "ios",
        WEB: "web",
    },

    // FCM Topics for group notifications
    TOPICS: {
        GLOBAL: "global_notifications",
        SYSTEM: "system_updates",
    },

    // Android notification channel
    ANDROID_CHANNEL: {
        CHAT: {
            id: "chat_channel",
            name: "Chat Messages",
        },
        SYSTEM: {
            id: "system_channel",
            name: "System Notifications",
        },
    },

    // Notification priorities
    PRIORITY: {
        HIGH: "high",
        NORMAL: "normal",
    },
};
