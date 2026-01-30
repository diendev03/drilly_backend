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
const addMembers = async (conversationId, userIds, role = "member") => {
  const db = await getConnection();

  // 1️⃣ Lấy danh sách user (id + name) từ profile
  const [profiles] = await db.query(
    `SELECT account_id, name FROM profile WHERE account_id IN (${userIds.map(() => '?').join(',')})`,
    userIds
  );

  console.log(`🔍 addMembers: Found ${profiles.length} profiles for userIds: ${userIds.join(',')}`);

  if (profiles.length === 0) {
    console.log(`⚠️ addMembers: No profiles found, skipping insert`);
    return [];
  }

  // 2️⃣ Build danh sách giá trị cho INSERT (include last_read_at)
  const values = profiles.map(
    (u) => `(${conversationId}, ${u.account_id}, ${db.escape(u.name)}, ${db.escape(role)}, NOW(), NOW())`
  ).join(',');

  // 3️⃣ Insert nhiều dòng cùng lúc
  const [result] = await db.query(`
    INSERT INTO conversation_member (conversation_id, user_id, name, role, join_at, last_read_at)
    VALUES ${values};
  `);

  console.log(`✅ addMembers: Inserted ${profiles.length} members into conversation ${conversationId}`);

  return {
    insertedCount: profiles.length,
    conversation_id: conversationId,
  };
};

// ✅ Thêm một thành viên
const addMember = async (conversationId, userId, role = "member", name = null) => {
  const db = await getConnection();
  await db.execute(
    `INSERT INTO conversation_member (conversation_id, user_id, name, role, join_at, last_read_at)
     VALUES (?, ?, ?, ?, NOW(), NOW())`,
    [conversationId, userId, name, role]
  );
  return { conversation_id: conversationId, user_id: userId, role };
};

const findPrivateConversation = async (user1, user2) => {
  const db = await getConnection();

  // Ensure IDs are integers (Critical for Web requests)
  const u1 = parseInt(user1);
  const u2 = parseInt(user2);

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
  console.log(`🔍 findPrivateConversation: u1=${u1} (${typeof u1}), u2=${u2} (${typeof u2})`);
  const [rows] = await db.execute(query, [u1, u2]);
  console.log(`📋 findPrivateConversation result: ${rows.length > 0 ? `Found conv ${rows[0].id}` : 'Not found'}`);
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
    m.created_at AS last_message_at,
    (SELECT COUNT(*) FROM messages msg 
     WHERE msg.conversation_id = c.id 
     AND msg.created_at > cm1.last_read_at) AS unread_count
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
    console.log(`🔍 getConversations for account_id: ${account_id}`);
    const [rows] = await db.execute(query, [account_id]);
    console.log(`📋 Found ${rows.length} conversations`);

    return rows.map(row => ({
      conversation_id: row.conversation_id,
      receiver_id: row.receiver_id,
      title: row.type === 'private' ? row.receiver_name : row.conversation_title,
      avatar: row.receiver_avatar,
      last_message: row.last_message,
      last_message_at: row.last_message_at,
      unread_count: row.unread_count || 0
    }));
  } catch (error) {
    console.error('❌ getConversations error:', error.message);
    throw error;
  }
};

const markAsRead = async (userId, conversationId) => {
  const db = await getConnection();
  const [result] = await db.execute(
    `UPDATE conversation_member 
         SET last_read_at = NOW() 
         WHERE user_id = ? AND conversation_id = ?`,
    [userId, conversationId]
  );
  return result.affectedRows > 0;
};



module.exports = {
  createConversation,
  addMember,
  addMembers,
  findPrivateConversation,
  getConversations,
  markAsRead
};

