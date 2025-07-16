const dbPromise = require('../config/database');

// Kết nối DB
const getConnection = async () => {
    return await dbPromise;
};

const createTransaction = async ({ account_id, type, category_id, amount, note, transaction_date, image_url }) => {
    const conn = await getConnection();
    const [result] = await conn.query(
        'INSERT INTO transaction (account_id, type, category, amount, note, transaction_date, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [account_id, type, category_id, amount, note, transaction_date, image_url]
    );
    const newId = result.insertId;

  // Lấy dữ liệu vừa tạo
  const transaction = await getTransactionById({id: newId });

  return transaction;
};

const getTransactionsByAccount = async ({ account_id, start_date, end_date,type, category_id,id }) => {
  const conn = await getConnection();

  let query = `
    SELECT * FROM transaction 
    WHERE (? IS NULL OR account_id = ?)
      AND (? IS NULL OR transaction_date >= ?)
      AND (? IS NULL OR transaction_date <= ?)
      AND (? IS NULL OR id = ?)
      AND (? IS NULL OR type = ?)
      AND (? IS NULL OR category = ?)
    ORDER BY transaction_date DESC
  `;

  const [rows] = await conn.query(query, [
    account_id,account_id,
    start_date, start_date,
    end_date, end_date,
    id, id,
    type, type,
    category_id, category_id
  ]);

  return rows;
};

const getTransactionById = async ({ account_id, id }) => {
    const conn = await getConnection();
    let query = `SELECT * FROM transaction WHERE id = ?`;
    let params = [id];

    if (account_id) {
        query += ` AND account_id = ?`;
        params.push(account_id);
    }

    const [rows] = await conn.query(query, params);
    return rows[0];
};

const getTransactionSummaryByAccount = async ({ account_id, start_date, end_date }) => {
    console.log('getTransactionSummaryByAccount', { account_id, start_date, end_date });
    const conn = await getConnection();
    const query = `
        SELECT 
            IFNULL(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
            IFNULL(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
        FROM transaction
        WHERE account_id = ?
          AND transaction_date >= ?
          AND transaction_date <= ?
    `;

    const [rows] = await conn.query(query, [account_id, start_date, end_date]);
    return rows[0];
};


const updateTransaction = async ({ id, account_id, type, category_id, amount, note, transaction_date, image_url }) => {
    const conn = await getConnection();
    const [result] = await conn.query(
        'UPDATE transaction SET type = ?, category = ?, amount = ?, note = ?, transaction_date = ?, image_url = ? WHERE account_id = ? AND id = ?',
        [type, category_id, amount, note, transaction_date, image_url, account_id, id]
    );
    return await getTransactionById({ account_id: account_id, id: id });
};

const deleteTransaction = async ({ id, account_id }) => {
    const conn = await getConnection();
    const [result] = await conn.query(
        'DELETE FROM transaction WHERE id = ? AND account_id = ?',
        [id, account_id]
    );
    return result.affectedRows > 0;
};

module.exports = {
    createTransaction,
    getTransactionsByAccount,
    getTransactionById,
    getTransactionSummaryByAccount,
    updateTransaction,
    deleteTransaction
};