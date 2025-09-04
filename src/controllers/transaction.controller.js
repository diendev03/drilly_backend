const transactionService = require('../services/transaction.service');
const { sendSuccess, sendCreated, sendFail, sendError } = require('../utils/response');

const createTransaction = async (req, res) => {
    try {
        if (!req.account) {
            return sendFail(res, 401, 'Unauthorized');
        }
        if (!req.body || !req.body.type || !req.body.category || !req.body.amount || !req.body.date) {
            return sendFail(res, 400, 'Missing required fields');
        }
        const { type, category, amount, note, date, image_url } = req.body;
        const account_id = req.account.account_id;
        const transaction = await transactionService.createTransaction({ account_id, type, category, amount, note, date, image_url });
        sendCreated(res, "Transaction created successfully", transaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        sendError(res, 500, 'Internal server error');
    }
};

const filterTransactions = async (req, res) => {
    try {
        if (!req.account) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const account_id = req.account.account_id;
        const { start_date, end_date, type, category } = req.query;
console.log('Filtering transactions with params:', { account_id, start_date, end_date, type, category });
        const transactions = await transactionService.getTransactionsByAccount({ 
            account_id, 
            start_date, 
            end_date, 
            type, 
            category
        });
        sendSuccess(res, "Danh sách giao dịch", transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        sendError(res, 500, 'Internal server error');
    }
};

const getTransactionById = async (req, res) => {
    try {
        if (!req.account) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const account_id = req.account.account_id;
        const transactionId = req.params.id;
        if (!transactionId) {
            return sendFail(res, 400, 'Transaction ID is required');
        }
        const transaction = await transactionService.getTransactionById({ account_id: account_id, id: transactionId });
        if (!transaction) {
            return sendFail(res, 404, 'Transaction not found');
        }
        sendSuccess(res, "Transaction details", transaction);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        sendError(res, 500, 'Internal server error');
    }
};

const getTransactionSummaryByAccount = async (req, res) => {
    try {
        if (!req.account) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!req.query.start_date || !req.query.end_date) {
            return sendFail(res, 400, 'Start date and end date are required');
        }
        const account_id = req.account.account_id;
        const { start_date, end_date } = req.query;
        const summary = await transactionService.getTransactionSummaryByAccount({ account_id, start_date, end_date });
        sendSuccess(res, "Transaction summary", summary);
    } catch (error) {
        console.error('Error fetching transaction summary:', error);
        sendError(res, 500, 'Internal server error');
    }
};

const updateTransaction = async (req, res) => {
    try {
        if (!req.account) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const account_id = req.account.account_id;
        const transactionId = req.params.id;
        if (!transactionId) {
            return sendFail(res, 400, 'Transaction ID is required');
        }
        const { type, category_id, amount, note, date, image_url } = req.body;
        const updatedTransaction = await transactionService.updateTransaction({ id: transactionId, account_id, type, category_id, amount, note, date, image_url });
        if (!updatedTransaction) {
            return sendFail(res, 404, 'Transaction not found');
        }
        sendSuccess(res, "Transaction updated successfully", updatedTransaction);
    } catch (error) {
        console.error('Error updating transaction:', error);
        sendError(res, 500, 'Internal server error');
    }
};

const deleteTransaction = async (req, res) => {
    try {
        if (!req.account) {
            return sendError(res, 401, 'Unauthorized');
        }
        const account_id = req.account.account_id;
        const transactionId = req.params.id;
        if (!transactionId) {
            return sendFail(res, 400, 'Transaction ID is required');
        }
        const deleted = await transactionService.deleteTransaction({ id: transactionId, account_id });
        if (!deleted) {
            return sendFail(res, 404, 'Transaction not found');
        }
        sendSuccess(res, "Transaction deleted successfully");
    } catch (error) {
        console.error('Error deleting transaction:', error);
        sendError(res, 500, 'Internal server error');
    }
};

module.exports = {
    createTransaction,
    filterTransactions,
    getTransactionById,
    updateTransaction,
    getTransactionSummaryByAccount,
    deleteTransaction
};
