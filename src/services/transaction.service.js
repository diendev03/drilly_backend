const transactionRepo = require('../repositories/transaction.repository');

const createTransaction = async ({ account_id, type, category, amount, note, date, image_url }) => {
    const transaction = await transactionRepo.createTransaction({ account_id, type, category, amount, note, date, image_url });
    return transaction;
};

const getTransactionsByAccount = async ({ account_id, start_date, end_date, type, category}) => {
    console.log('Fetching transactions with params:', { account_id, start_date, end_date, type, category });
    const transactions = await transactionRepo.getTransactionsByAccount({
        account_id:account_id,
        start_date:start_date, 
        end_date:end_date, 
        type:type, 
        category:category
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

const getTransactionById = async ({account_id,id}) => {
     const transactions = await transactionRepo.getTransactionsByAccount({ account_id:account_id, id:id });
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
    const transactions = await transactionRepo.getTransactionSummaryByAccount({ account_id:account_id, start_date:start_date, end_date:end_date });
    return transactions;
};

const updateTransaction = async ({ id, account_id, type, category_id, amount, note, date, image_url }) => {
    const updated = await transactionRepo.updateTransaction({ id, account_id, type, category_id, amount, note, date, image_url });
    return updated;
};

const deleteTransaction = async ({ id, account_id }) => {
    const deleted = await transactionRepo.deleteTransaction({ id, account_id });
    return deleted;
};

module.exports = {
    createTransaction,
    getTransactionsByAccount,
    getTransactionById,
    getTransactionSummaryByAccount,
    updateTransaction,
    deleteTransaction,
};