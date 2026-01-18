const messageService = require("../services/message.service");

const socketEvent = require("../sockets/socket.events");
const { sendSuccess, sendFail, sendError } = require("../utils/response");
const { SocketManager, ROOM } = require("../sockets/socket.manager");
const profileRepo = require("../repositories/profile.repository");
const messageEvent = require("../message/message.event");

const sendMessage = async (req, res) => {
  try {
    const senderId = req.account?.account_id;
    if (!senderId) return sendFail(res, "Invalid authentication token");

    const { receiver_id, conversation_id, content } = req.body;
    if (!content) return sendFail(res, "Content is required");



    // ✅ Gửi tin nhắn
    const message = await messageService.sendMessage({
      senderId,
      receiverId: receiver_id,
      conversationId: conversation_id,
      content,
    });

    const finalConvId = message.conversation_id;

    // Fetch Sender Profile for Notification
    let senderProfile = { name: '', avatar: null };
    try {
      const p = await profileRepo.getProfile(senderId);
      if (p) {
        senderProfile.name = p.name;
        senderProfile.avatar = p.avatar;
      }
    } catch (e) {
      console.error("Fetch profile error:", e.message);
    }

    // Enrich message payload for Socket
    const socketMessage = {
      ...message,
      senderId: message.sender_id, // camelCase
      conversationId: message.conversation_id, // camelCase
      senderName: senderProfile.name,
      senderAvatar: senderProfile.avatar,
      timestamp: message.created_at
    };

    // ✅ Phát sự kiện socket cho toàn bộ thành viên trong phòng chat
    console.log(`📡 Emitting RECEIVE_MESSAGE to conv:${finalConvId}`, socketMessage);
    SocketManager.emitToConversation(
      finalConvId,
      socketEvent.RECEIVE_MESSAGE,
      socketMessage
    );

    // ✅ Also emit to user rooms IF user is NOT in conv room (smart emit to avoid duplicates)
    await SocketManager.emitToConversationOrUser(
      finalConvId,
      senderId,
      socketEvent.RECEIVE_MESSAGE,
      socketMessage
    );
    if (receiver_id) {
      await SocketManager.emitToConversationOrUser(
        finalConvId,
        receiver_id,
        socketEvent.RECEIVE_MESSAGE,
        socketMessage
      );
    }

    // ✅ Cập nhật last message (always to user rooms for conversation list)
    const updatePayload = { conversationId: finalConvId, message: socketMessage };
    SocketManager.emitToUser(
      senderId,
      socketEvent.UPDATE_LAST_MESSAGE,
      updatePayload
    );
    if (receiver_id) {
      SocketManager.emitToUser(
        receiver_id,
        socketEvent.UPDATE_LAST_MESSAGE,
        updatePayload
      );
    }

    // ✅ Push notification cho background/killed state (non-blocking)
    if (receiver_id) {
      messageEvent.onMessageCreated(message, [receiver_id], senderProfile).catch(err => {
        console.error("Push notification error (non-blocking):", err.message);
      });
    }

    return sendSuccess(res, "Send message successfully", message);
  } catch (err) {
    console.error("❌ SendMessage error:", err);
    return sendError(res, "Server error");
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.account?.account_id;
    if (!userId) {
      return sendFail(res, "Invalid authentication token");
    }

    const { conversationId } = req.params;
    if (!conversationId) {
      return sendFail(res, "conversationId is required");
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await messageService.getMessages({
      conversationId,
      userId,
      page,
      limit,
    });

    return sendSuccess(res, "Get messages successfully", result);
  } catch (err) {
    console.error("GetMessages error:", err);
    return sendError(res, "Server error");
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
