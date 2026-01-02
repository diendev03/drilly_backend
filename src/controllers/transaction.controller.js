const transactionService = require('../services/transaction.service');
const { sendSuccess, sendCreated, sendFail, sendError } = require('../utils/response');
const pusher = require('../config/pusher');
const accountRepository = require('../repositories/account.repository');
const walletRepository = require('../repositories/wallet.repository');
const categoryRepository = require('../repositories/transaction_category.reposotory');
const { SocketManager } = require('../sockets/socket.manager');
const SocketEvent = require('../sockets/socket.events');

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

        // Preflight validations to avoid SQL FK errors
        const account = await accountRepository.getAccountById(account_id);
        if (!account) return sendFail(res, 404, 'Account not found');

        const categoryRow = await categoryRepository.getCategoryById(category);
        if (!categoryRow) return sendFail(res, 400, 'Category not found');

        const wallet = await walletRepository.getWalletByAccountId({ account_id });
        if (!wallet || !wallet.id) return sendFail(res, 404, 'Wallet not found for account');
        const transaction = await transactionService.createTransaction({ account_id, type, category, amount, note, date, image_url });
        // Trigger push notification but don't let Pusher errors fail the request
        try {
            pusher.trigger('transactions-channel', 'new-transaction', transaction);
        } catch (pushErr) {
            console.error('Pusher trigger failed (non-fatal):', pushErr);
        }

        // 🔌 Socket.IO emit
        try {
            SocketManager.emitToUser(account_id, SocketEvent.TRANSACTION_CREATED, transaction);

            // Also emit updated balance and chart data
            const [balance, chart] = await Promise.all([
                transactionService.getTransactionSummaryBalance({ account_id }),
                transactionService.getTransactionsMonthlyChart({ account_id })
            ]);
            SocketManager.emitToUser(account_id, SocketEvent.BALANCE_UPDATED, balance);
            SocketManager.emitToUser(account_id, SocketEvent.CHART_UPDATED, chart);
        } catch (socketErr) {
            console.error('Socket emit failed:', socketErr);
        }

        sendCreated(res, "Transaction created successfully", transaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        if (error && error.message && error.message.toLowerCase().includes('wallet not found')) {
            return sendFail(res, 404, 'Wallet not found for account');
        }
        // Map common SQL foreign key constraint to a clearer client error
        if (error && (error.code === 'ER_NO_REFERENCED_ROW_2' || (error.message && error.message.toLowerCase().includes('foreign key')))) {
            return sendFail(res, 400, 'Invalid reference: missing related record (account/category)');
        }
        return sendError(res, 500, 'Internal server error');
    }
};

const getTransactionByFilter = async (req, res) => {
    try {
        if (!req.account) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const account_id = req.account.account_id;
        const {
            start_date,
            end_date,
            type,
            categories,
            limit,
            offset
        } = req.query;

        const transactions = await transactionService.getTransactionsByFilter({
            account_id,
            start_date,
            end_date,
            type,
            categories,
            limit,
            offset
        });

        sendSuccess(res, "Danh sách giao dịch", transactions);
    } catch (error) {
        sendError(res, 500, 'Internal server error');
    }
};

const getTransactionsMonthlyChart = async (req, res) => {
    try {
        if (!req.account) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const account_id = req.account.account_id;

        const transactions = await transactionService.getTransactionsMonthlyChart({
            account_id
        });

        sendSuccess(res, "Danh sách giao dịch", transactions);
    } catch (error) {
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
        const id = req.params.id;
        if (!id) {
            return sendFail(res, 400, 'Transaction ID is required');
        }
        const { amount, note, type } = req.body;
        if (!amount) {
            return sendFail(res, 400, 'Amount is required');
        }
        if (!type) {
            return sendFail(res, 400, 'Type is required');
        }
        const updatedTransaction = await transactionService.updateTransaction({ id, account_id, amount, note, type });
        if (!updatedTransaction) {
            return sendFail(res, 404, 'Transaction not found');
        }

        // 🔌 Socket.IO emit
        try {
            SocketManager.emitToUser(account_id, SocketEvent.TRANSACTION_UPDATED, updatedTransaction);

            // Also emit updated balance and chart data
            const [balance, chart] = await Promise.all([
                transactionService.getTransactionSummaryBalance({ account_id }),
                transactionService.getTransactionsMonthlyChart({ account_id })
            ]);
            SocketManager.emitToUser(account_id, SocketEvent.BALANCE_UPDATED, balance);
            SocketManager.emitToUser(account_id, SocketEvent.CHART_UPDATED, chart);
        } catch (socketErr) {
            console.error('Socket emit failed:', socketErr);
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

        // 🔌 Socket.IO emit
        try {
            SocketManager.emitToUser(account_id, SocketEvent.TRANSACTION_DELETED, { id: transactionId });

            // Also emit updated balance and chart data
            const [balance, chart] = await Promise.all([
                transactionService.getTransactionSummaryBalance({ account_id }),
                transactionService.getTransactionsMonthlyChart({ account_id })
            ]);
            SocketManager.emitToUser(account_id, SocketEvent.BALANCE_UPDATED, balance);
            SocketManager.emitToUser(account_id, SocketEvent.CHART_UPDATED, chart);
        } catch (socketErr) {
            console.error('Socket emit failed:', socketErr);
        }

        sendSuccess(res, "Transaction deleted successfully", deleted);
    } catch (error) {
        console.error('Error deleting transaction:', error);
        sendError(res, 500, 'Internal server error');
    }
};

const getTransactionSummaryBalance = async (req, res) => {
    try {
        if (!req.account) {
            return sendError(res, 401, 'Unauthorized');
        }
        const account_id = req.account.account_id;

        const summary = await transactionService.getTransactionSummaryBalance({ account_id });
        sendSuccess(res, "Transaction summarry", summary);
    } catch (error) {
        console.error('Error get transaction summarry:', error);
        sendError(res, 500, 'Error get transaction summarry');
    }
}

module.exports = {
    createTransaction,
    getTransactionByFilter,
    getTransactionsMonthlyChart,
    getTransactionById,
    updateTransaction,
    getTransactionSummaryByAccount,
    deleteTransaction,
    getTransactionSummaryBalance
};
