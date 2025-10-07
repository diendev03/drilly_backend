const dbPromise = require('../config/database');

const getConnection = async () => {
  return await dbPromise;
};

// ✅ Tạo profile
const createProfile = async ({
  account_id,
  name = '',
  email = '',
  birthday = null,
  gender = null,
  my_color = '',
  avatar = '',
  location = ''
}) => {
  const query = `
    INSERT INTO profile (account_id, name, email, birthday, gender, my_color, avatar, location, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  if (!my_color || my_color.trim() === '') {
    my_color = 'DBA507';
  }
  try {
    const db = await getConnection();
    const [result] = await db.execute(query, [
      account_id, name, email, birthday, gender, my_color, avatar, location
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
    SELECT * FROM profile
    WHERE account_id = ?
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

// ✅ Cập nhật profile
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
  const query = `
    UPDATE profile
    SET name = ?,  birthday = ?, gender = ?, my_color = ?, avatar = ?, bio = ?, location = ?
    WHERE account_id = ?
  `;
  try {
    const db = await getConnection();
    const [result] = await db.execute(query, [
      name, birthday, gender, my_color, avatar, bio, location, account_id
    ]);
    if (result.affectedRows === 0) throw new Error('Không tìm thấy profile');
    return {};
  } catch (error) {
    console.error('❌ Lỗi updateProfile:', error.message);
    throw error;
  }
};

// Tìm profile
const findProfile = async ({ keyword }) => {
  const db = await getConnection();
  const query = `
    SELECT p.account_id, p.name, p.avatar, c.id AS conversation_id
FROM profile p
LEFT JOIN conversation_member cm1 ON cm1.user_id = p.account_id
LEFT JOIN conversation c 
    ON c.id = cm1.conversation_id 
   AND c.type = 'private'
LEFT JOIN conversation_member cm2 
    ON cm2.conversation_id = c.id 
   AND cm2.user_id = ?
WHERE p.name LIKE ?

  `;
  try {
    const [result] = await db.execute(query, [`%${keyword}%`]);
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
// File: src/models/profile.model.js