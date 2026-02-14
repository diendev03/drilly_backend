const conversationService = require("../services/conversation.service");
const { sendCreated, sendSuccess, sendFail, sendError } = require('../utils/response');
const socketEvent = require("../sockets/socket.events");
const { SocketManager } = require("../sockets/socket.manager");

const createConversation = async (req, res) => {
  try {
    const accountId = req.account?.account_id;
    if (!accountId) {
      return sendFail(res, 'Invalid authentication token');
    }

    const { type, title, members } = req.body;

    if (!type) {
      return sendFail(res, "Type is required");
    }

    const conversation = await conversationService.createConversation(
      type,
      title,
      accountId,
      members
    );

    return sendCreated(res, "Create conversation successfully", conversation);
  } catch (err) {
    console.error("CreateConversation error:", err);
    return sendError(res, "Server error");
  }
};

const getConversations = async (req, res) => {
  try {
    const accountId = req.account?.account_id;
    if (!accountId) {
      return sendFail(res, 'Invalid authentication token');
    }

    const conversations = await conversationService.getConversations(accountId);
    return sendSuccess(res, "Get conversations successfully", conversations);
  } catch (error) {
    console.error('❌ getConversations error:', error.message);
    return sendError(res, "Server error");
  }
};


const markAsRead = async (req, res) => {
  try {
    const accountId = req.account?.account_id;
    const { id } = req.params; // conversationId

    console.log(`DEBUG markAsRead: params=${JSON.stringify(req.params)}, account=${JSON.stringify(req.account)}`);

    if (!accountId) return sendFail(res, 'Invalid authentication token');
    if (!id) return sendFail(res, 'Conversation ID required');

    console.log(`🔍 Marking conversation ${id} as read for user ${accountId}`);

    await conversationService.markAsRead(accountId, id);

    // ✅ Emit socket event update badge
    console.log(`📡 Emitting MESSAGE_READ to conversation ${id}`);
    SocketManager.emitToConversation(parseInt(id), socketEvent.MESSAGE_READ, {
      conversationId: parseInt(id),
      readerId: accountId,
      readAt: new Date()
    });

    return sendSuccess(res, "Marked as read");
  } catch (error) {
    console.error('❌ markAsRead error:', error.message);
    return sendError(res, `Server error: ${error.message}`);
  }
};

module.exports = {
  createConversation,
  getConversations,
  markAsRead
};
