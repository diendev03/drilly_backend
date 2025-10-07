const conversationRepo = require("../repositories/conversation.repository");
const profileRepo = require("../repositories/profile.repository");
const messageRepo = require("../repositories/message.repository");

const sendMessage = async ({ senderId, receiverId, conversationId, content }) => {
  let convId = conversationId;
  let type = null;

  // ✅ Nếu có receiverId → xác định là private chat
  if (receiverId) {
    type = "private";

    // 🔍 Kiểm tra xem đã có cuộc hội thoại private giữa 2 user chưa
    const existingConv = await conversationRepo.findPrivateConversation(senderId, receiverId);

    if (existingConv) {
      convId = existingConv.id;
    } else {
      // 🆕 Tạo mới conversation private
      const conv = await conversationRepo.createConversation("private", null);

      const senderName = await profileRepo.getName(senderId);
      const receiverName = await profileRepo.getName(receiverId);

      await conversationRepo.addMember(conv.id, senderId, "member", senderName || "Unknown");
      await conversationRepo.addMember(conv.id, receiverId, "member", receiverName || "Unknown");

      convId = conv.id;
    }
  }

  // ✅ Nếu không có receiverId → dùng conversationId (group/channel)
  if (!receiverId) {
    if (!convId) throw new Error("conversationId is required when no receiverId provided");

    // Lấy type từ DB (để xác định group / channel)
    const conv = await conversationRepo.getConversationById(convId);
    if (!conv) throw new Error("Conversation not found");

    type = conv.type;
  }

  // ✅ Gửi tin nhắn
  const message = await messageRepo.sendMessage(convId, senderId, content);

  return {
    ...message,
    conversation_id: convId,
    is_me: true,
  };
};


const getMessages = async (conversationId, userId, page = 1, limit = 50) => {
    return await messageRepo.getMessages(conversationId, userId, page, limit);
};;

module.exports = {
    sendMessage,
    getMessages
};
