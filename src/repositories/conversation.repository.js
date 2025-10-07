const dbPromise = require('../config/database');

const getConnection = async () => {
    return await dbPromise;
};

// ✅ Tạo conversation
const createConversation = async (type, title) => {
    const db = await getConnection();
    const [result] = await db.execute(
        `INSERT INTO conversation (type, title, created_at)
     VALUES (?, ?, NOW())`,
        [type, title || null]
    );

    return {
        id: result.insertId,
        type,
        title,
        created_at: new Date()
    };
};

// ✅ Thêm thành viên
const addMember = async (conversationId, userId, role, name) => {
    const db = await getConnection();
    const [result] = await db.execute(
        `INSERT INTO conversation_member (conversation_id, user_id, name, role, join_at)
     VALUES (?, ?, ?, ?, NOW())`,
        [conversationId, userId, name, role]
    );

    return {
        id: result.insertId,
        conversation_id: conversationId,
        user_id: userId,
        name,
        role,
        join_at: new Date()
    };
};

const findPrivateConversation = async (user1, user2) => {
    const db = await getConnection();
    const query = `
    SELECT c.*
    FROM conversation c
    JOIN conversation_member m1 ON c.id = m1.conversation_id
    JOIN conversation_member m2 ON c.id = m2.conversation_id
    WHERE c.type = 'private'
      AND m1.user_id = ?
      AND m2.user_id = ?
    LIMIT 1
  `;
    const [rows] = await db.execute(query, [user1, user2]);
    return rows[0] || null;
};

/// Lấy danh sách
const getConversations = async (account_id) => {
  const query = `
    SELECT 
    c.id AS conversation_id,
    c.type,
    c.title AS conversation_title,
    cm2.user_id AS receiver_id,
    p.name AS receiver_name,
    p.avatar AS receiver_avatar,
    m.content AS last_message,
    m.created_at AS last_message_at
FROM conversation_member cm1
JOIN conversation c 
     ON c.id = cm1.conversation_id
LEFT JOIN conversation_member cm2
     ON cm2.conversation_id = c.id AND cm2.user_id != cm1.user_id
LEFT JOIN profile p
     ON cm2.user_id = p.account_id
LEFT JOIN (
    SELECT t1.*
    FROM messages t1
    INNER JOIN (
        SELECT conversation_id, MAX(created_at) AS max_created
        FROM messages
        GROUP BY conversation_id
    ) t2
    ON t1.conversation_id = t2.conversation_id AND t1.created_at = t2.max_created
) m
     ON m.conversation_id = c.id
WHERE cm1.user_id = ?
ORDER BY m.created_at DESC;
  `;

  try {
    const db = await getConnection();
    const [rows] = await db.execute(query, [account_id]);

    return rows.map(row => ({
      conversation_id: row.conversation_id,
      receiver_id: row.receiver_id,
      title: row.type === 'private' ? row.receiver_name : row.conversation_title,
      avatar: row.receiver_avatar,
      last_message: row.last_message,
      last_message_at: row.last_message_at
    }));
  } catch (error) {
    console.error('❌ getConversations error:', error.message);
    throw error;
  }
};



module.exports = {
    createConversation,
    addMember,
    findPrivateConversation,
    getConversations
};

