const conversationRepo = require("../repositories/conversation.repository");
const messageRepo = require("../repositories/message.repository");

// ✅ Gửi tin nhắn (tối ưu)
const sendMessage = async ({ senderId, receiverId, conversationId, content }) => {
  try {
    if (!content?.trim()) throw new Error("Nội dung tin nhắn không hợp lệ");

    let convId = Number(conversationId) || null;

    // 🔹 1️⃣ Nếu chưa có conversationId → tìm hoặc tạo mới cuộc trò chuyện private
    if (!convId) {
      if (!receiverId) throw new Error("Thiếu receiverId khi chưa có conversationId");

      // Tìm cuộc trò chuyện private giữa 2 user
      const existingConv = await conversationRepo.findPrivateConversation(senderId, receiverId);

      if (existingConv) {
        convId = existingConv.id;
      } else {
        // Tạo mới cuộc trò chuyện và thêm 2 thành viên
        const conv = await conversationRepo.createConversation("private", null);
        await conversationRepo.addMembers(conv.id, [senderId, receiverId], "member");
        convId = conv.id;
      }
    }

    // 🔹 2️⃣ Gửi tin nhắn
    const message = await messageRepo.sendMessage(convId, senderId, content.trim());

    // 🔹 3️⃣ Trả về dữ liệu đồng nhất
    return {
      id: message.id,
      sender_id: senderId,
      conversation_id: convId,
      content: message.content,
      created_at: message.created_at,
    };
  } catch (error) {
    console.error('message.service.sendMessage error:', error);
    throw error;
  }
};



const getMessages = async ({conversationId, userId, page = 1, limit = 50}) => {
  try {
    return await messageRepo.getMessages({conversationId, userId, page, limit});
  } catch (error) {
    console.error('message.service.getMessages error:', error);
    throw error;
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
