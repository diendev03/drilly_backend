const dbPromise = require('../config/database');

const getConnection = async () => {
  return await dbPromise;
};

// Tạo account mới
const createAccount = async ({ email, phone, password, role = 0, status = 'active' }) => {
  const query = `
    INSERT INTO account (email, phone, password, created_at, status, role)
    VALUES (?, ?, ?, NOW(), ?, ?)
  `;
  try {
    const db = await getConnection();
    await db.execute(query, [email, phone, password, status, role]);
    account = await getAccountByEmail(email);
    await db.execute(
      'INSERT INTO wallet (account_id, balance, created_at) VALUES (?, 0, NOW())',
      [account.id]
    );

    return account;
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

// Tìm account theo email hoặc phone
const getAccountByEmailOrPhone = async (identifier) => {
  const query = `SELECT * FROM account WHERE email = ? OR phone = ? LIMIT 1`;
  try {
    const db = await getConnection();
    const [rows] = await db.execute(query, [identifier, identifier]);
    return rows.length ? rows[0] : null;
  } catch (error) {
    console.error('❌ Lỗi getAccountByEmailOrPhone:', error.message);
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
  getAccountByEmailOrPhone,
  getAccountById,
  changePassword
};
