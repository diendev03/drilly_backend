/**
 * Message Event Handlers
 * Triggers push notifications when message events occur
 */

const pushDispatcher = require("../push/push.dispatcher");
const { PUSH_TYPE } = require("../push/push.type");

/**
 * Called when a new message is created
 * Sends push notification to receivers (excluding sender)
 * 
 * @param {object} message - Message object with id, conversation_id, content, etc.
 * @param {number[]} receiverIds - Array of receiver user IDs
 * @param {object} senderProfile - Sender profile with name, avatar
 */
const onMessageCreated = async (message, receiverIds, senderProfile) => {
    try {
        // Don't send push if no receivers
        if (!receiverIds || receiverIds.length === 0) {
            console.log("⚠️ onMessageCreated: No receivers for push");
            return;
        }

        // Build push data
        const pushData = {
            messageId: message.id,
            conversationId: message.conversation_id,
            senderId: message.sender_id,
            senderName: senderProfile?.name || "User",
            senderAvatar: senderProfile?.avatar || "",
            content: message.content,
        };

        // Dispatch push notification
        const result = await pushDispatcher.dispatch(
            PUSH_TYPE.CHAT,
            receiverIds,
            pushData
        );

        console.log(`📱 Push sent for message ${message.id}:`, result);
        return result;
    } catch (error) {
        console.error("❌ onMessageCreated push error:", error.message);
        // Don't throw - push failure shouldn't break message sending
    }
};

/**
 * Called when a call is initiated
 * @param {object} callData - Call details
 * @param {number} receiverId - Receiver user ID
 */
const onCallInitiated = async (callData, receiverId) => {
    try {
        const result = await pushDispatcher.dispatchToUser(
            PUSH_TYPE.CALL,
            receiverId,
            callData
        );
        console.log(`📞 Call push sent to user ${receiverId}:`, result);
        return result;
    } catch (error) {
        console.error("❌ onCallInitiated push error:", error.message);
    }
};

module.exports = {
    onMessageCreated,
    onCallInitiated,
};
