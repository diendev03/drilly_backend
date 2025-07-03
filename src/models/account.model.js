const dbPromise = require('../config/database');

const getConnection = async () => {
  return await dbPromise;
};

// ✅ Tạo tài khoản người dùng
const createAccount = async ({ email, password, role = 0, status = 'active' }) => {
  console.log('🔧 Tạo account:', { email, role, status });
  const query = `
    INSERT INTO account (email, password, created_at, status, role)
    VALUES (?, ?, NOW(), ?, ?)
  `;

  try {
    const db = await getConnection();
    await db.execute(query, [email, password, status, role]);
    const account = await findAccountByEmail(email);
    if (!account) throw new Error('Tạo account thất bại');
    return account;
  } catch (error) {
    console.error('❌ Lỗi createAccount:', error.message);
    throw error;
  }
};

// ✅ Tìm account theo email
const findAccountByEmail = async (email) => {
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

// ✅ Tìm account theo ID
const findAccountById = async (account_id) => {
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

module.exports = {
  createAccount,
  findAccountByEmail,
  findAccountById,
};