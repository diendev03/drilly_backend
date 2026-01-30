const conversationRepo = require("../repositories/conversation.repository");
const messageRepo = require("../repositories/message.repository");

// ✅ Gửi tin nhắn (tối ưu)
const sendMessage = async ({ senderId, receiverId, conversationId, content, mediaUrl, mediaType, mediaName }) => {
  try {
    console.log(`📨 sendMessage called:`, { senderId, receiverId, conversationId, content: content?.substring(0, 20), mediaType });

    // Allow empty content if media is present
    if (!content?.trim() && !mediaUrl) throw new Error("Nội dung tin nhắn không hợp lệ");

    let convId = null;

    // 🔹 1️⃣ Luôn tìm conversation giữa 2 user (bỏ qua conversationId client gửi vì có thể sai)
    if (!receiverId) throw new Error("Thiếu receiverId");

    console.log(`🔍 Finding private conversation between ${senderId} and ${receiverId}`);

    // Tìm cuộc trò chuyện private giữa 2 user
    const existingConv = await conversationRepo.findPrivateConversation(senderId, receiverId);

    if (existingConv) {
      convId = existingConv.id;
      console.log(`✅ Found existing conversation: ${convId}`);
    } else {
      // Tạo mới cuộc trò chuyện và thêm 2 thành viên
      console.log(`📝 Creating new private conversation...`);
      const conv = await conversationRepo.createConversation("private", null);
      console.log(`📝 Created conversation: ${conv.id}`);

      await conversationRepo.addMembers(conv.id, [senderId, receiverId], "member");
      convId = conv.id;
      console.log(`✅ New conversation created with id: ${convId}`);
    }

    // 🔹 2️⃣ Gửi tin nhắn
    console.log(`💬 Inserting message into conversation ${convId}`);
    const message = await messageRepo.sendMessage(convId, senderId, content?.trim() || '', mediaUrl, mediaType, mediaName);
    console.log(`✅ Message inserted with id: ${message.id}`);

    // 🔹 2.1️⃣ Cập nhật last_read_at cho sender (Để không bị tính là unread)
    await conversationRepo.markAsRead(senderId, convId);

    // 🔹 3️⃣ Trả về dữ liệu đồng nhất
    return {
      id: message.id,
      sender_id: senderId,
      conversation_id: convId,
      content: message.content,
      media_url: message.media_url,
      media_type: message.media_type,
      media_name: message.media_name,
      created_at: message.created_at,
    };
  } catch (error) {
    console.error('❌ message.service.sendMessage error:', error);
    throw error;
  }
};



const getMessages = async ({ conversationId, userId, page = 1, limit = 50 }) => {
  try {
    return await messageRepo.getMessages({ conversationId, userId, page, limit });
  } catch (error) {
    console.error('message.service.getMessages error:', error);
    throw error;
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
