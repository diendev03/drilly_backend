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


// ✅ Get messages
const getMessages = async (conversationId, userId, page = 1, limit = 50) => {
  const db = await getConnection();
  const offset = (page - 1) * limit;
  const safeLimit = parseInt(limit, 10) || 50;
  const safeOffset = parseInt(offset, 10) || 0;

  const query = `
    SELECT 
      p.account_id AS receiver_id,
      p.name AS receiver_name,
      p.avatar AS receiver_avatar,
      m.id AS message_id,
      m.sender_id,
      m.content,
      m.created_at,
      CASE WHEN m.sender_id = ? THEN TRUE ELSE FALSE END AS is_me
    FROM messages m
    JOIN conversation_member cm ON cm.conversation_id = m.conversation_id
    JOIN profile p ON p.account_id = cm.user_id
    WHERE m.conversation_id = ?
      AND cm.user_id != ?
    ORDER BY m.created_at DESC
    LIMIT ${safeLimit} OFFSET ${safeOffset};
  `;

  // chỉ còn 3 placeholder => 3 giá trị
  const [rows] = await db.execute(query, [Number(userId), Number(conversationId), Number(userId)]);

  if (!rows.length) return null;

  const receiver = {
    receiver_id: rows[0].receiver_id,
    receiver_name: rows[0].receiver_name,
    receiver_avatar: rows[0].receiver_avatar,

  };

  const messages = rows.map((r) => ({
    id: r.message_id,
    sender_id: r.sender_id,
    content: r.content,
    created_at: r.created_at,
    is_me: !!r.is_me,
  }));

  return { ...receiver, messages: messages.reverse() };
};




module.exports = {
    sendMessage,
    getMessages
};
