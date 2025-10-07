const conversationService = require("../services/conversation.service");
const { sendCreated, sendSuccess, sendFail, sendError } = require('../utils/response');

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


module.exports = {
  createConversation,
  getConversations
};
