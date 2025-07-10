const dbPromise = require('../config/database');

const getConnection = async () => {
  return await dbPromise;
};

// Tạo account mới
const createAccount = async ({ email, password, role = 0, status = 'active' }) => {
  console.log('🔧 Tạo account:', { email, role, status });
  const query = `
    INSERT INTO account (email, password, created_at, status, role)
    VALUES (?, ?, NOW(), ?, ?)
  `;
  try {
    const db = await getConnection();
    await db.execute(query, [email, password, status, role]);
    return await getAccountByEmail(email);
  } catch (error) {
    console.error('❌ Lỗi createAccount:', error.message);
    throw error;
  }
};

// Tìm account theo email
const getAccountByEmail = async (email) => {
  const query = `SELECT * FROM account WHERE email = ? LIMIT 1`;
  try {
    const db = await getConnection();
    const [rows] = await db.execute(query, [email]);
    return rows.length ? rows[0] : null;
  } catch (error) {
    console.error('❌ Lỗi findAccountByEmail:', error.message);
    throw error;
  }
};



// Tìm account theo ID
const getAccountById = async (account_id) => {
  const query = `SELECT * FROM account WHERE id = ? LIMIT 1`;
  try {
    const db = await getConnection();
    const [rows] = await db.execute(query, [account_id]);
    return rows.length ? rows[0] : null;
  } catch (error) {
    console.error('❌ Lỗi findAccountById:', error.message);
    throw error;
  }
};


// Đổi mật khẩu
const changePassword = async (account_id, newPassword) => {
  const query = `UPDATE account SET password = ? WHERE id = ?`;
  try {
    const db = await getConnection();
    await db.execute(query, [newPassword, account_id]);
    return true;
  } catch (error) {
    console.error('❌ Lỗi changePassword:', error.message);
    throw error;
  }
};

module.exports = {
  createAccount,
  getAccountByEmail,
  getAccountById,
  changePassword
};
