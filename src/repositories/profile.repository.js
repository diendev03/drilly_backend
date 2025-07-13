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
  mycolor = '',
  avatar = '',
  location = ''
}) => {
  const query = `
    INSERT INTO profile (account_id, name, email, birthday, gender, mycolor, avatar, location, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  try {
    const db = await getConnection();
    const [result] = await db.execute(query, [
      account_id, name, email, birthday, gender, mycolor, avatar, location
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
  mycolor,
  avatar,
  bio,
  location
}) => {
  const query = `
    UPDATE profile
    SET name = ?,  birthday = ?, gender = ?, mycolor = ?, avatar = ?, bio = ?, location = ?
    WHERE account_id = ?
  `;
  try {
    const db = await getConnection();
    const [result] = await db.execute(query, [
      name, birthday, gender, mycolor, avatar, bio, location, account_id
    ]);
    if (result.affectedRows === 0) throw new Error('Không tìm thấy profile');
    return {};
  } catch (error) {
    console.error('❌ Lỗi updateProfile:', error.message);
    throw error;
  }
};

module.exports = {
  createProfile,
  updateProfile,
  getProfile
};
// File: src/models/profile.model.js