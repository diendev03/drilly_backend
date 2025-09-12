const dbPromise = require('../config/database');
const walletReposotory = require('./wallet.repository');

// Kết nối DB
const getConnection = async () => {
    return await dbPromise;
};

const createTransaction = async ({ account_id, type, category, amount, note, date, image_url }) => {
    const conn = await getConnection();
    const [result] = await conn.query(
        'INSERT INTO transaction (account_id, type, category, amount, note, date, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [account_id, type, category, amount, note, date, image_url]
    );
    const newId = result.insertId;

    // Lấy balance
    const walletAmount = await walletReposotory.getWalletByAccountId(account_id);
    const currentBalance = walletAmount[0]?.balance ?? 0;

    // Đảm bảo amount là số
    const amountNum = Number(amount);
    let newAmount = currentBalance;

    (type === "income") ? newAmount += amountNum : newAmount -= amountNum;

    await walletReposotory.updateWalletBalance(
        account_id,
        walletAmount[0]?.id,
        newAmount
    );

    // Lấy dữ liệu vừa tạo
    const transaction = await getTransactionById({ id: newId });
    return transaction;
};


const getTransactionsByAccount = async ({ account_id, start_date, end_date, type, category, id }) => {
    const conn = await getConnection();
    let query = `
    SELECT * FROM transaction 
    WHERE (? IS NULL OR account_id = ?)
      AND (? IS NULL OR date >= ?)
      AND (? IS NULL OR date <= ?)
      AND (? IS NULL OR id = ?)
      AND (? IS NULL OR type = ?)
      AND (? IS NULL OR category = ?)
    ORDER BY date DESC
  `;

    const [rows] = await conn.query(query, [
        account_id, account_id,
        start_date, start_date,
        end_date, end_date,
        id, id,
        type, type,
        category, category
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
    const conn = await getConnection();
    const query = `
        SELECT 
            IFNULL(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
            IFNULL(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
        FROM transaction
        WHERE account_id = ?
          AND date >= ?
          AND date <= ?
    `;

    const [rows] = await conn.query(query, [account_id, start_date, end_date]);
    return rows[0];
};


const updateTransaction = async ({ id, account_id, amount, note, type }) => {
  const conn = await getConnection();

  // 1. Lấy thông tin giao dịch cũ
  const oldTransaction = await getTransactionById({ id, account_id });
  const oldAmount = Number(oldTransaction.amount);
  const oldType = oldTransaction.type;

  // 2. Lấy số dư ví hiện tại
  const walletInfo = await walletReposotory.getWalletByAccountId(account_id);
  const currentBalance = Number(walletInfo[0]?.balance ?? 0);
  let newBalance = currentBalance;

  // 3. Trừ giá trị cũ ra khỏi ví
  if (oldType === "income") {
    newBalance -= oldAmount;
  } else {
    newBalance += oldAmount;
  }

  // 4. Cộng lại giá trị mới vào ví
  const newAmount = Number(amount);
  if (type === "income") {
    newBalance += newAmount;
  } else {
    newBalance -= newAmount;
  }

  // 5. Cập nhật giao dịch
  await conn.query(
    'UPDATE transaction SET amount = ?, note = ?, type = ? WHERE account_id = ? AND id = ?',
    [newAmount, note, type, account_id, id]
  );

  // 6. Cập nhật số dư ví
  await walletReposotory.updateWalletBalance(
    account_id,
    walletInfo[0]?.id,
    newBalance
  );

  return await getTransactionById({ account_id, id });
};


const deleteTransaction = async ({ id, account_id }) => {
  const conn = await getConnection();

  // 1. Lấy giao dịch cũ để lấy amount & type
  const oldTransaction = await getTransactionById({ id, account_id });
  if (!oldTransaction) {
    throw new Error("Transaction not found.");
  }

  const amountNum = Number(oldTransaction.amount);
  const type = oldTransaction.type;

  // 2. Lấy thông tin ví hiện tại
  const walletInfo = await walletReposotory.getWalletByAccountId(account_id);
  const currentBalance = Number(walletInfo[0]?.balance ?? 0);
  let newBalance = currentBalance;

  // 3. Cập nhật số dư
  if (type === "income") {
    newBalance -= amountNum;
  } else {
    newBalance += amountNum;
  }

  // 4. Xóa giao dịch
  const [result] = await conn.query(
    'DELETE FROM transaction WHERE id = ? AND account_id = ?',
    [id, account_id]
  );

  // 5. Cập nhật lại số dư ví
  await walletReposotory.updateWalletBalance(
    account_id,
    walletInfo[0]?.id,
    newBalance
  );

  return result.affectedRows > 0;
};


const getTotalAmountByPeriod = async ({ account_id, type, mode }) => {
    const conn = await getConnection();

    let dateCondition = '';
    if (mode === 'today') {
        dateCondition = `DATE(date) = CURDATE()`;
    } else if (mode === 'week') {
        dateCondition = `YEARWEEK(date, 1) = YEARWEEK(CURDATE(), 1)`; // tuần bắt đầu từ thứ 2
    } else {
        throw new Error("Invalid mode. Use 'today' or 'week'.");
    }

    const query = `
        SELECT IFNULL(SUM(amount), 0) AS total
        FROM transaction
        WHERE account_id = ?
          AND type = ?
          AND ${dateCondition}
    `;

    const [rows] = await conn.query(query, [account_id, type]);
    return rows[0].total;
};


module.exports = {
    createTransaction,
    getTransactionsByAccount,
    getTransactionById,
    getTransactionSummaryByAccount,
    updateTransaction,
    deleteTransaction,
    getTotalAmountByPeriod
};