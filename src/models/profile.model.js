const dbPromise = require('../config/database');

const getConnection = async () => {
  return await dbPromise;
};

// ✅ Tạo profile
const createProfile = async ({
  account_id,
  name,
  email,
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
    console.log('✅ Profile created:', result.insertId);
    return result;
  } catch (error) {
    console.error('❌ Lỗi createProfile:', error.message);
    throw error;
  }
};

// ✅ Cập nhật profile
const updateProfile = async ({
  account_id,
  name,
  email,
  birthday,
  gender,
  mycolor,
  avatar,
  bio,
  location
}) => {
  const query = `
    UPDATE profile
    SET name = ?, email = ?, birthday = ?, gender = ?, mycolor = ?, avatar = ?, bio = ?, location = ?
    WHERE account_id = ?
  `;

  try {
    const db = await getConnection();
    const [result] = await db.execute(query, [
      name, email, birthday, gender, mycolor, avatar, bio, location, account_id
    ]);
    if (result.affectedRows === 0) throw new Error('Không tìm thấy profile');
    return result;
  } catch (error) {
    console.error('❌ Lỗi updateProfile:', error.message);
    throw error;
  }
};

module.exports = {
  createProfile,
  updateProfile,
};