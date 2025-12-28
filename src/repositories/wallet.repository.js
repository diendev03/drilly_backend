const dbPromise = require('../config/database');

const getConnection = async () => {
    return await dbPromise;
};

const createWallet = async (account_id, balance) => {
    const conn = await getConnection();
    await conn.query(
        'INSERT INTO wallet (account_id, balance, created_at) VALUES (?, ?, NOW())',
        [account_id, balance]
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

const updateWalletBalance = async (account_id, wallet_id, new_balance) => {
    if (!wallet_id) throw new Error("wallet_id is missing");

    const conn = await getConnection();
    await conn.query(
        'UPDATE wallet SET balance = ? WHERE id = ? AND account_id = ?',
        [new_balance, wallet_id, account_id]
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


module.exports = {
    createWallet,
    getWalletByAccountId,
    updateWalletBalance,
    deleteWalletByAccountId,
    getTotalBalanceByAccountId
};