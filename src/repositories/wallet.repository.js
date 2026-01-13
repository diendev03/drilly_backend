const dbPromise = require('../config/database');

const getConnection = async () => {
    return await dbPromise;
};

const createWallet = async (account_id, balance, name) => {
    const conn = await getConnection();
    await conn.query(
        'INSERT INTO wallet (account_id, balance, name, created_at) VALUES (?, ?, ?, NOW())',
        [account_id, balance, name]
    );
};

const getWalletByAccountId = async ({ account_id }) => {
    const conn = await getConnection();
    const [rows] = await conn.query(
        'SELECT * FROM wallet WHERE account_id = ?',
        [account_id]
    );
    return rows[0];
};

const getWalletById = async (id) => {
    const conn = await getConnection();
    const [rows] = await conn.query(
        'SELECT * FROM wallet WHERE id = ?',
        [id]
    );
    return rows[0];
};

const getAllWalletsByAccountId = async ({ account_id }) => {
    const conn = await getConnection();
    const [rows] = await conn.query(
        `SELECT
            w.*,
            COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
            COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expense
        FROM wallet w
        LEFT JOIN transaction t ON w.id = t.wallet_id
        WHERE w.account_id = ?
        GROUP BY w.id
        ORDER BY w.created_at ASC`,
        [account_id]
    );
    return rows;
};

const updateWallet = async (account_id, wallet_id, new_balance, name) => {
    if (!wallet_id) throw new Error("wallet_id is missing");

    const conn = await getConnection();
    await conn.query(
        'UPDATE wallet SET balance = ?, name = ? WHERE id = ? AND account_id = ?',
        [new_balance, name, wallet_id, account_id]
    );
};

const deleteWalletByAccountId = async (account_id, wallet_id) => {
    const conn = await getConnection();
    await conn.query(
        'DELETE FROM wallet WHERE account_id = ? AND id = ?',
        [account_id, wallet_id]
    );
};

const getTotalBalanceByAccountId = async (account_id) => {
    const conn = await getConnection();
    const [rows] = await conn.query(
        'SELECT SUM(balance) as total_balance FROM wallet WHERE account_id = ?',
        [account_id]
    );
    return rows[0]?.total_balance || 0;
};


const updateWalletBalance = async (account_id, wallet_id, new_balance) => {
    const conn = await getConnection();
    const [result] = await conn.query(
        'UPDATE wallet SET balance = ? WHERE id = ? AND account_id = ?',
        [new_balance, wallet_id, account_id]
    );
    console.log(`💰 UPDATE wallet #${wallet_id} balance = ${new_balance}, affected: ${result.affectedRows}`);
};

module.exports = {
    createWallet,
    getWalletByAccountId,
    getWalletById,
    getAllWalletsByAccountId,
    updateWallet,
    deleteWalletByAccountId,
    getTotalBalanceByAccountId,
    updateWalletBalance
};