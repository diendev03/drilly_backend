const dbPromise = require('../config/database');
const walletRepository = require('./wallet.repository');

// Kết nối DB
const getConnection = async () => {
  return await dbPromise;
};

// Tạo giao dịch mới
const createTransaction = async ({ account_id, wallet_id, type, category, amount, note, date, images, created_from }) => {
  const conn = await getConnection();

  // Insert transaction with wallet_id
  const imagesJson = images ? JSON.stringify(images) : null;
  const [result] = await conn.query(
    `INSERT INTO transaction (account_id, wallet_id, type, category, amount, note, date, images, created_from, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [account_id, wallet_id, type, category, amount, note, date, imagesJson, created_from || 'MANUAL']
  );

  // Update wallet balance
  if (wallet_id) {
    const wallet = await walletRepository.getWalletById(wallet_id);
    if (wallet) {
      const currentBalance = Number(wallet.balance ?? 0);
      const amountNum = Number(amount);
      const newBalance = type === 'income' ? currentBalance + amountNum : currentBalance - amountNum;
      await walletRepository.updateWalletBalance(account_id, wallet_id, newBalance);
    }
  }

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
    SELECT t.id, t.account_id, t.wallet_id, t.type, t.category, t.amount, t.note, t.date, t.images, t.created_from, rt.frequency as recurrence_frequency
    FROM transaction t
    LEFT JOIN recurring_transactions rt ON t.source_recurring_id = rt.id
    WHERE 1=1
  `;
  const params = [];

  if (account_id) {
    query += ` AND t.account_id = ?`;
    params.push(account_id);
  }

  if (start_date) {
    query += ` AND t.date >= ?`;
    params.push(start_date);
  }

  if (end_date) {
    query += ` AND t.date <= ?`;
    params.push(end_date);
  }

  if (type) {
    query += ` AND t.type = ?`;
    params.push(type);
  }

  if (id) {
    query += ` AND t.id = ?`;
    params.push(id);
  }

  // Categories (IN)
  if (categories && typeof categories === 'string') {
    const categoryList = categories.split(',').map(Number).filter(id => !isNaN(id));
    if (categoryList.length > 0) {
      const placeholders = categoryList.map(() => '?').join(', ');
      query += ` AND t.category IN (${placeholders})`;
      params.push(...categoryList);
    }
  }

  query += ` ORDER BY t.date DESC, t.created_at DESC`;

  if (typeof limit !== 'undefined' && typeof offset !== 'undefined') {
    query += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));
  }

  const [rows] = await conn.query(query, params);
  return rows.map(row => ({
    ...row,
    images: row.images ? JSON.parse(row.images) : []
  }));
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
  if (rows[0]) {
    rows[0].images = rows[0].images ? JSON.parse(rows[0].images) : [];
  }
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
const updateTransaction = async ({ id, account_id, amount, note, type, images }) => {
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
  const imagesJson = images ? JSON.stringify(images) : undefined;
  // Dynamic update query part if images is provided? Or just always update it? 
  // For simplicity assuming images provided. If typically undefined, we should handle it.
  // But standard update usually replaces all fields. Let's assume passed.
  // Actually, let's keep it robust.

  // NOTE: The user requested "update" functionality which presumably might include images.
  // The original code only updated `amount`, `note`, `type`. 
  // I should add `images`.

  await conn.query(
    `UPDATE transaction SET amount = ?, note = ?, type = ?, images = ? WHERE id = ? AND account_id = ?`,
    [newAmount, note, type, imagesJson, id, account_id]
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

// --- RECURRING TRANSACTIONS METHODS ---

// Create a new recurring transaction configuration
const createRecurringTransaction = async ({ account_id, wallet_id, type, category, amount, note, frequency, start_date, start_day, next_run_date }) => {
  const conn = await getConnection();
  const [result] = await conn.query(
    `INSERT INTO recurring_transactions 
    (account_id, wallet_id, type, category, amount, note, frequency, start_date, start_day, next_run_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [account_id, wallet_id, type, category, amount, note, frequency, start_date, start_day, next_run_date]
  );
  return result.insertId;
};

// Get all active recurring transactions that represent due payments
const getDueRecurringTransactions = async () => {
  const conn = await getConnection();
  // Select ACTIVE items where next_run_date is today or in the past
  // Using UTC date for comparison to be safe, or database engine's CURDATE()
  const [rows] = await conn.query(
    `SELECT * FROM recurring_transactions 
         WHERE status = 'ACTIVE' 
         AND next_run_date <= CURDATE()`
  );
  return rows;
};

// Update next_run_date
const updateNextRunDate = async (id, nextRunDate) => {
  const conn = await getConnection();
  await conn.query(
    `UPDATE recurring_transactions SET next_run_date = ? WHERE id = ?`,
    [nextRunDate, id]
  );
};

// Manually insert a transaction derived from a recurring template
// NOTE: This includes setting source_recurring_id, run_date, and created_from
const createTransactionFromRecurring = async ({ account_id, wallet_id, type, category, amount, note, source_recurring_id, run_date }) => {
  const conn = await getConnection();

  // Try insert. If duplicate (source_recurring_id + run_date), it will throw error due to UNIQUE index.
  // We let the caller handle the error (or ignore it).
  const [result] = await conn.query(
    `INSERT INTO transaction (account_id, wallet_id, type, category, amount, note, date, created_from, source_recurring_id, run_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'RECURRING', ?, ?, NOW())`,
    [account_id, wallet_id, type, category, amount, note, run_date, source_recurring_id, run_date]
  );

  // Update wallet balance
  if (wallet_id) {
    const wallet = await walletRepository.getWalletById(wallet_id);
    if (wallet) {
      const currentBalance = Number(wallet.balance ?? 0);
      const amountNum = Number(amount);
      const newBalance = type === 'income' ? currentBalance + amountNum : currentBalance - amountNum;
      await walletRepository.updateWalletBalance(account_id, wallet_id, newBalance);
    }
  }

  return result.insertId;
};

// Link an existing transaction to a recurring configuration
const linkTransactionToRecurring = async ({ id, account_id, source_recurring_id, run_date }) => {
  const conn = await getConnection();
  await conn.query(
    `UPDATE transaction SET source_recurring_id = ?, created_from = 'RECURRING', run_date = ? WHERE id = ? AND account_id = ?`,
    [source_recurring_id, run_date, id, account_id]
  );
};

// Update recurring frequency
const updateRecurringTransactionFrequency = async (id, frequency) => {
  const conn = await getConnection();
  await conn.query(
    `UPDATE recurring_transactions SET frequency = ? WHERE id = ?`,
    [frequency, id]
  );
};

// Update recurring status (e.g. to INACTIVE)
const updateRecurringTransactionStatus = async (id, status) => {
  const conn = await getConnection();
  await conn.query(
    `UPDATE recurring_transactions SET status = ? WHERE id = ?`,
    [status, id]
  );
};

module.exports = {
  createTransaction,
  getTransactionsByFilter,
  getTransactionsMonthlyChart,
  getTransactionById,
  getTransactionSummaryByAccount,
  updateTransaction,
  deleteTransaction,
  getTotalAmountByPeriod,
  createRecurringTransaction,
  getDueRecurringTransactions,
  updateNextRunDate,
  createTransactionFromRecurring,
  linkTransactionToRecurring,
  updateRecurringTransactionFrequency,
  updateRecurringTransactionStatus
};
