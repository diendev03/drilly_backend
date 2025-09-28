const dbPromise = require('../config/database');
const walletRepository = require('./wallet.repository');

// Kết nối DB
const getConnection = async () => {
  return await dbPromise;
};

// Tạo giao dịch mới
const createTransaction = async ({ account_id, type, category, amount, note, date, image_url }) => {
  const conn = await getConnection();
  const [result] = await conn.query(
    `INSERT INTO transaction (account_id, type, category, amount, note, date, image_url, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [account_id, type, category, amount, note, date, image_url]
  );

  const transaction = await getTransactionById({ account_id, id: result.insertId });
  return transaction;
};

// Lấy danh sách giao dịch theo điều kiện
const getTransactionsByFilter = async ({
  account_id,
  start_date,
  end_date,
  type,
  categories,
  id,
  limit,
  offset
}) => {
  const conn = await getConnection();

  let query = `
    SELECT id, account_id, type, category, amount, note, date 
    FROM transaction 
    WHERE 1=1
  `;
  const params = [];

  if (account_id) {
    query += ` AND account_id = ?`;
    params.push(account_id);
  }

  if (start_date) {
    query += ` AND date >= ?`;
    params.push(start_date);
  }

  if (end_date) {
    query += ` AND date <= ?`;
    params.push(end_date);
  }

  if (type) {
    query += ` AND type = ?`;
    params.push(type);
  }

  if (id) {
    query += ` AND id = ?`;
    params.push(id);
  }

  // Categories (IN)
  if (categories && typeof categories === 'string') {
    const categoryList = categories.split(',').map(Number).filter(id => !isNaN(id));
    if (categoryList.length > 0) {
      const placeholders = categoryList.map(() => '?').join(', ');
      query += ` AND category IN (${placeholders})`;
      params.push(...categoryList);
    }
  }

  query += ` ORDER BY date DESC, created_at DESC`;

  if (typeof limit !== 'undefined' && typeof offset !== 'undefined') {
    query += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));
  }

  const [rows] = await conn.query(query, params);
  return rows;
};

const getTransactionsMonthlyChart = async ({ account_id }) => {
  const conn = await getConnection();

  const query = `
    SELECT id, type, amount, date
    FROM transaction
    WHERE account_id = ?
      AND MONTH(date) = MONTH(CURDATE())
      AND YEAR(date) = YEAR(CURDATE())
    ORDER BY date ASC
  `;

  const [rows] = await conn.query(query, [account_id]);

  return rows;
};

// Lấy 1 giao dịch theo ID
const getTransactionById = async ({ account_id, id }) => {
  const conn = await getConnection();

  let query = `SELECT * FROM transaction WHERE id = ?`;
  const params = [id];

  if (account_id) {
    query += ` AND account_id = ?`;
    params.push(account_id);
  }

  const [rows] = await conn.query(query, params);
  return rows[0];
};

// Lấy tổng thu - chi trong khoảng thời gian
const getTransactionSummaryByAccount = async ({ account_id, start_date, end_date }) => {
  const conn = await getConnection();

  const query = `
    SELECT 
      IFNULL(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
      IFNULL(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
    FROM transaction
    WHERE account_id = ?
      AND date BETWEEN ? AND ?
  `;

  const [rows] = await conn.query(query, [account_id, start_date, end_date]);
  return rows[0];
};

// Cập nhật giao dịch và ví
const updateTransaction = async ({ id, account_id, amount, note, type }) => {
  const conn = await getConnection();

  // 1. Lấy thông tin giao dịch cũ
  const oldTransaction = await getTransactionById({ account_id, id });
  if (!oldTransaction) throw new Error("Transaction not found");

  const oldAmount = Number(oldTransaction.amount);
  const oldType = oldTransaction.type;

  // 2. Lấy ví hiện tại
  const wallet = await walletRepository.getWalletByAccountId({ account_id });
  if (!wallet || !wallet.id) throw new Error("Wallet not found");

  const currentBalance = Number(wallet.balance ?? 0);
  let newBalance = currentBalance;

  // 3. Gỡ giá trị cũ
  newBalance += (oldType === "income") ? -oldAmount : oldAmount;

  // 4. Cộng giá trị mới
  const newAmount = Number(amount);
  newBalance += (type === "income") ? newAmount : -newAmount;

  // 5. Cập nhật giao dịch
  await conn.query(
    `UPDATE transaction SET amount = ?, note = ?, type = ? WHERE id = ? AND account_id = ?`,
    [newAmount, note, type, id, account_id]
  );

  // 6. Cập nhật ví
  await walletRepository.updateWalletBalance(account_id, wallet.id, newBalance);

  return await getTransactionById({ account_id, id });
};

// Xóa giao dịch và hoàn lại số dư
const deleteTransaction = async ({ id, account_id }) => {
  const conn = await getConnection();

  const oldTransaction = await getTransactionById({ id, account_id });
  if (!oldTransaction) throw new Error("Transaction not found");

  const amountNum = Number(oldTransaction.amount);
  const type = oldTransaction.type;

  const wallet = await walletRepository.getWalletByAccountId({ account_id });
  if (!wallet || !wallet.id) throw new Error("Wallet not found");

  const currentBalance = Number(wallet.balance ?? 0);
  const newBalance = (type === "income") ? currentBalance - amountNum : currentBalance + amountNum;

  const [result] = await conn.query(
    `DELETE FROM transaction WHERE id = ? AND account_id = ?`,
    [id, account_id]
  );

  await walletRepository.updateWalletBalance(account_id, wallet.id, newBalance);

  return result.affectedRows > 0;
};

// Tính tổng theo ngày hoặc tuần
const getTotalAmountByPeriod = async ({ account_id, type, mode }) => {
  const conn = await getConnection();

  let dateCondition = '';
  if (mode === 'today') {
    dateCondition = `DATE(date) = CURDATE()`;
  } else if (mode === 'week') {
    dateCondition = `YEARWEEK(date, 1) = YEARWEEK(CURDATE(), 1)`;
  } else {
    throw new Error("Invalid mode. Use 'today' or 'week'.");
  }

  const query = `
    SELECT IFNULL(SUM(amount), 0) AS total
    FROM transaction
    WHERE account_id = ? AND type = ? AND ${dateCondition}
  `;

  const [rows] = await conn.query(query, [account_id, type]);
  return rows[0]?.total ?? 0;
};

module.exports = {
  createTransaction,
  getTransactionsByFilter,
  getTransactionsMonthlyChart,
  getTransactionById,
  getTransactionSummaryByAccount,
  updateTransaction,
  deleteTransaction,
  getTotalAmountByPeriod
};
