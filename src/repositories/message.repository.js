const dbPromise = require('../config/database');

const getConnection = async () => {
    return await dbPromise;
};

const sendMessage = async (conversationId, senderId, content) => {
    const db = await getConnection();
    const [result] = await db.execute(
        `INSERT INTO messages (conversation_id, sender_id, content, created_at)
     VALUES (?, ?, ?, NOW())`,
        [conversationId, senderId, content]
    );
    return {
        id: result.insertId,
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        created_at: new Date()
    };
};

// ✅ Get messages (chỉ trả về danh sách message)
const getMessages = async ({ conversationId, userId, page = 1, limit = 50 }) => {
  const db = await getConnection();

  const safeLimit = Number(limit) > 0 ? Number(limit) : 50;
  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safeOffset = (safePage - 1) * safeLimit;

  let convId = conversationId ? Number(conversationId) : null;

  // 🔹 Nếu chưa có convId → tìm cuộc trò chuyện private giữa 2 user
  if (!convId) {
    const [existing] = await db.execute(
      `
      SELECT c.id
      FROM conversation c
      JOIN conversation_member m1 ON c.id = m1.conversation_id
      JOIN conversation_member m2 ON c.id = m2.conversation_id
      WHERE c.type = 'private'
        AND m1.user_id = ?
        AND m2.user_id != ?
      LIMIT 1
      `,
      [Number(userId), Number(userId)]
    );

    if (existing.length > 0) {
      convId = Number(existing[0].id);
    } else {
      return [];
    }
  }

  if (!convId || isNaN(convId)) {
    console.warn("⚠️ convId invalid:", convId);
    return [];
  }

  // 🔹 Lấy danh sách tin nhắn
  const [rows] = await db.query(
    `
    SELECT 
      m.id,
      m.sender_id,
      m.conversation_id,
      m.content,
      m.created_at
    FROM messages m
    WHERE m.conversation_id = ?
    ORDER BY m.created_at DESC
    LIMIT ${safeLimit} OFFSET ${safeOffset};
    `,
    [convId]
  );

  // 🔹 Đảo ngược thứ tự để tin cũ nhất ở trên cùng
  return (rows || []).reverse();
};




module.exports = {
    sendMessage,
    getMessages
};
