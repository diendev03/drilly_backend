const dbPromise = require('../config/database');

const getConnection = async () => {
  return await dbPromise;
};

// ✅ Tạo profile
const createProfile = async ({
  account_id,
  name = '',
  email = '',
  phone = '',
  birthday = null,
  gender = null,
  my_color = '',
  avatar = '',
  location = ''
}) => {
  const query = `
    INSERT INTO profile (account_id, name, email, phone, birthday, gender, my_color, avatar, location, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  if (!my_color || my_color.trim() === '') {
    my_color = 'DBA507';
  }
  try {
    const db = await getConnection();
    const [result] = await db.execute(query, [
      account_id, name, email, phone, birthday, gender, my_color, avatar, location
    ]);

    if (result.affectedRows === 1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi createProfile:', error.message);
    return false;
  }
};

// ✅ Lấy profile theo account_id
const getProfile = async (account_id) => {
  const query = `
    SELECT 
      p.*,
      (SELECT COUNT(*) FROM user_follow WHERE following_id = p.account_id) AS followers_count,
      (SELECT COUNT(*) FROM user_follow WHERE follower_id = p.account_id) AS following_count
    FROM profile p
    WHERE p.account_id = ?
  `;
  try {
    const db = await getConnection();
    const [rows] = await db.execute(query, [account_id]);
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Lỗi getProfileByAccountId:', error.message);
    throw error;
  }
};

// ✅ Cập nhật profile (Dynamic Query)
const updateProfile = async ({
  account_id,
  name,
  birthday,
  gender,
  my_color,
  avatar,
  bio,
  location
}) => {
  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  if (birthday !== undefined) {
    updates.push('birthday = ?');
    values.push(birthday);
  }
  if (gender !== undefined) {
    updates.push('gender = ?');
    values.push(gender);
  }
  if (my_color !== undefined) {
    updates.push('my_color = ?');
    values.push(my_color);
  }
  if (avatar !== undefined) {
    updates.push('avatar = ?');
    values.push(avatar);
  }
  if (bio !== undefined) {
    updates.push('bio = ?');
    values.push(bio);
  }
  if (location !== undefined) {
    updates.push('location = ?');
    values.push(location);
  }

  // Nếu không có gì để update thì return luôn
  if (updates.length === 0) {
    return await getProfile(account_id);
  }

  const query = `
    UPDATE profile
    SET ${updates.join(', ')}
    WHERE account_id = ?
  `;
  values.push(account_id);

  try {
    const db = await getConnection();
    await db.execute(query, values);

    // Trả về data mới nhất sau khi update
    return await getProfile(account_id);
  } catch (error) {
    console.error('❌ Lỗi updateProfile:', error.message);
    throw error;
  }
};

// Tìm profile by name, phone, or id (includes follow status, excludes blocked users)
const findProfile = async ({ keyword, user_id }) => {
  const db = await getConnection();

  // Check if keyword is numeric (could be account_id or phone)
  const isNumeric = /^\d+$/.test(keyword);

  const query = `
    SELECT 
      p.account_id, 
      p.name, 
      p.avatar,
      p.bio,
      a.phone,
      MAX(c.id) AS conversation_id,
      CASE 
        WHEN MAX(f1.id) IS NOT NULL AND MAX(f2.id) IS NOT NULL THEN 'mutual'
        WHEN MAX(f1.id) IS NOT NULL THEN 'following'
        WHEN MAX(f2.id) IS NOT NULL THEN 'followed'
        ELSE 'none'
      END AS follow_status
    FROM profile p
    JOIN account a ON a.id = p.account_id
    LEFT JOIN conversation_member cm1 ON cm1.user_id = p.account_id
    LEFT JOIN conversation c 
      ON c.id = cm1.conversation_id 
      AND c.type = 'private'
    LEFT JOIN conversation_member cm2 
      ON cm2.conversation_id = c.id 
      AND cm2.user_id = ?
    LEFT JOIN user_follow f1 ON f1.follower_id = ? AND f1.following_id = p.account_id
    LEFT JOIN user_follow f2 ON f2.follower_id = p.account_id AND f2.following_id = ?
    LEFT JOIN user_block b ON (b.blocker_id = ? AND b.blocked_id = p.account_id)
                           OR (b.blocker_id = p.account_id AND b.blocked_id = ?)
    WHERE (
      p.name LIKE ? 
      OR a.phone LIKE ?
      OR (? = 1 AND p.account_id = ?)
    )
      AND p.account_id != ?
      AND b.id IS NULL
    GROUP BY p.account_id, p.name, p.avatar, p.bio, a.phone
    LIMIT 20
  `;
  try {
    const searchPattern = `%${keyword}%`;
    const accountId = isNumeric ? parseInt(keyword) : 0;

    const [result] = await db.execute(query, [
      user_id,           // cm2.user_id
      user_id,           // f1.follower_id
      user_id,           // f2.following_id
      user_id,           // b.blocker_id
      user_id,           // b.blocked_id
      searchPattern,     // p.name LIKE
      searchPattern,     // a.phone LIKE
      isNumeric ? 1 : 0, // check if searching by id
      accountId,         // p.account_id =
      user_id            // exclude self
    ]);
    return result;
  } catch (error) {
    console.error('❌ Lỗi findProfile:', error.message);
    throw error;
  }
};

module.exports = {
  createProfile,
  updateProfile,
  getProfile,
  findProfile
};