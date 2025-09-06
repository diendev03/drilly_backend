const transactionRepo = require('../repositories/transaction.repository');
const walletReposotory = require('../repositories/wallet.repository');

const createTransaction = async ({ account_id, type, category, amount, note, date, image_url }) => {
    const transaction = await transactionRepo.createTransaction({ account_id, type, category, amount, note, date, image_url });
    return transaction;
};

const getTransactionsByAccount = async ({ account_id, start_date, end_date, type, category }) => {
    console.log('Fetching transactions with params:', { account_id, start_date, end_date, type, category });
    const transactions = await transactionRepo.getTransactionsByAccount({
        account_id: account_id,
        start_date: start_date,
        end_date: end_date,
        type: type,
        category: category
    });
    const result = transactions.map(item => ({
        id: item.id,
        account_id: item.account_id,
        type: item.type,
        category: item.category,
        amount: item.amount,
        note: item.note,
        date: item.date,
        image_url: item.image_url,
        created_at: item.created_at
    }));
    return result;
};

const getTransactionById = async ({ account_id, id }) => {
    const transactions = await transactionRepo.getTransactionsByAccount({ account_id: account_id, id: id });
    const result = transactions.map(item => ({
        id: item.id,
        account_id: item.account_id,
        type: item.type,
        category: item.category,
        amount: item.amount,
        note: item.note,
        date: item.date,
        image_url: item.image_url,
        created_at: item.created_at
    }));
    return result[0];
};

const getTransactionSummaryByAccount = async ({ account_id, start_date, end_date }) => {
    const transactions = await transactionRepo.getTransactionSummaryByAccount({ account_id: account_id, start_date: start_date, end_date: end_date });
    return transactions;
};

const updateTransaction = async ({ id, account_id, amount, note }) => {
    const updated = await transactionRepo.updateTransaction({ id, account_id, amount, note });
    return updated;
};

const deleteTransaction = async ({ id, account_id }) => {
    const deleted = await transactionRepo.deleteTransaction({ id, account_id });
    return deleted;
};


const getTransactionSummaryBalance = async ({ account_id }) => {
    const [balance, income_day, expense_day, income_week, expense_week] = await Promise.all([
        walletReposotory.getWalletByAccountId(account_id),
        transactionRepo.getTotalAmountByPeriod({ account_id, type: 'income', mode: 'today' }),
        transactionRepo.getTotalAmountByPeriod({ account_id, type: 'expense', mode: 'today' }),
        transactionRepo.getTotalAmountByPeriod({ account_id, type: 'income', mode: 'week' }),
        transactionRepo.getTotalAmountByPeriod({ account_id, type: 'expense', mode: 'week' }),
    ]);

    return {
        balance: balance[0]?.balance ?? 0,
        income_day,
        expense_day,
        income_week,
        expense_week
    };
};

module.exports = {
    createTransaction,
    getTransactionsByAccount,
    getTransactionById,
    getTransactionSummaryByAccount,
    updateTransaction,
    deleteTransaction, 
    getTransactionSummaryBalance,
};