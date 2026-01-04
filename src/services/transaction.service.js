const transactionRepo = require('../repositories/transaction.repository');
const walletReposotory = require('../repositories/wallet.repository');

const createTransaction = async ({ account_id, wallet_id, type, category, amount, note, date, images, created_from }) => {
    try {
        // Repository now handles wallet balance update internally
        const transaction = await transactionRepo.createTransaction({ account_id, wallet_id, type, category, amount, note, date, images, created_from });
        return transaction;
    } catch (error) {
        console.error('transaction.service.createTransaction error:', error);
        throw error;
    }
};

const getTransactionsByFilter = async ({
    account_id,
    start_date,
    end_date,
    type,
    categories,
    limit,
    offset
}) => {
    try {
        console.log(`user ${account_id} fetching transactions`);

        const transactions = await transactionRepo.getTransactionsByFilter({
            account_id,
            start_date,
            end_date,
            type,
            categories,
            limit: typeof limit !== 'undefined' ? Number(limit) : undefined,
            offset: typeof offset !== 'undefined' ? Number(offset) : undefined,
        });

        return transactions;
    } catch (error) {
        console.error('transaction.service.getTransactionsByFilter error:', error);
        throw error;
    }
};

const getTransactionsMonthlyChart = async ({
    account_id
}) => {
    try {
        const transactions = await transactionRepo.getTransactionsMonthlyChart({
            account_id
        });

        const result = transactions.map(item => ({
            id: item.id,
            type: item.type,
            amount: item.amount,
            date: item.date,
        }));

        return result;
    } catch (error) {
        console.error('transaction.service.getTransactionsMonthlyChart error:', error);
        throw error;
    }
};

const getTransactionById = async ({ account_id, id }) => {
    try {
        const transactions = await transactionRepo.getTransactionsByFilter({ account_id: account_id, id: id });
        const result = transactions.map(item => ({
            id: item.id,
            account_id: item.account_id,
            type: item.type,
            category: item.category,
            amount: item.amount,
            note: item.note,
            date: item.date,
            images: item.images,
            created_at: item.created_at,
            created_from: item.created_from,
            recurrence_frequency: item.recurrence_frequency
        }));
        return result[0];
    } catch (error) {
        console.error('transaction.service.getTransactionById error:', error);
        throw error;
    }
};

const getTransactionSummaryByAccount = async ({ account_id, start_date, end_date }) => {
    try {
        const transactions = await transactionRepo.getTransactionSummaryByAccount({ account_id: account_id, start_date: start_date, end_date: end_date });
        return transactions;
    } catch (error) {
        console.error('transaction.service.getTransactionSummaryByAccount error:', error);
        throw error;
    }
};

const updateTransaction = async ({ id, account_id, amount, note, type, images, recurrence }) => {
    try {
        const oldTransaction = await transactionRepo.getTransactionById({ account_id, id });
        if (!oldTransaction) throw new Error("Transaction not found");

        const updated = await transactionRepo.updateTransaction({ id, account_id, amount, note, type, images });

        await recalculateWalletAfterTransactionChange({
            account_id,
            wallet_id: oldTransaction.wallet_id,
            oldAmount: Number(oldTransaction.amount),
            oldType: oldTransaction.type,
            newAmount: Number(amount),
            newType: type,
        });

        // 7. Handle Recurrence Update
        if (recurrence && recurrence.frequency) {
            if (recurrence.frequency === 'NONE') {
                // Stop recurring if linked
                if (oldTransaction.source_recurring_id) {
                    await transactionRepo.updateRecurringTransactionStatus(oldTransaction.source_recurring_id, 'INACTIVE');
                }
            } else {
                // Update frequency
                if (oldTransaction.source_recurring_id) {
                    await transactionRepo.updateRecurringTransactionFrequency(oldTransaction.source_recurring_id, recurrence.frequency);
                } else {
                    // Was MNAUAL, now RECURRING. Create new config.
                    const startDate = new Date(oldTransaction.date);
                    const startDay = startDate.getDate();
                    let nextRunDate = new Date(startDate);

                    if (recurrence.frequency === 'DAILY') nextRunDate.setDate(nextRunDate.getDate() + 1);
                    else if (recurrence.frequency === 'WEEKLY') nextRunDate.setDate(nextRunDate.getDate() + 7);
                    else if (recurrence.frequency === 'MONTHLY') nextRunDate.setMonth(nextRunDate.getMonth() + 1);

                    const formatDate = (d) => d.toISOString().split('T')[0];

                    const recurringId = await transactionRepo.createRecurringTransaction({
                        account_id,
                        wallet_id: oldTransaction.wallet_id,
                        type: type || oldTransaction.type,
                        category: oldTransaction.category,
                        amount: amount || oldTransaction.amount,
                        note: note || oldTransaction.note,
                        frequency: recurrence.frequency,
                        start_date: formatDate(startDate),
                        start_day: startDay,
                        next_run_date: formatDate(nextRunDate)
                    });

                    await linkTransactionToRecurring({
                        id: id,
                        account_id,
                        source_recurring_id: recurringId,
                        run_date: formatDate(startDate)
                    });
                }
            }
        }

        return updated;
    } catch (error) {
        if (error.message !== 'Transaction not found') {
            console.error('transaction.service.updateTransaction error:', error);
        }
        throw error;
    }
};


const deleteTransaction = async ({ id, account_id }) => {
    try {
        const oldTransaction = await transactionRepo.getTransactionById({ account_id, id });
        if (!oldTransaction) throw new Error("Transaction not found");

        const deleted = await transactionRepo.deleteTransaction({ id, account_id });

        await recalculateWalletAfterTransactionChange({
            account_id,
            wallet_id: oldTransaction.wallet_id,
            oldAmount: Number(oldTransaction.amount),
            oldType: oldTransaction.type,
            newAmount: 0,
            newType: null,
        });

        return deleted;
    } catch (error) {
        if (error.message !== 'Transaction not found') {
            console.error('transaction.service.deleteTransaction error:', error);
        }
        throw error;
    }
};



const getTransactionSummaryBalance = async ({ account_id }) => {
    try {
        const [totalBalance, income_day, expense_day, income_week, expense_week] = await Promise.all([
            walletReposotory.getTotalBalanceByAccountId(account_id),
            transactionRepo.getTotalAmountByPeriod({ account_id, type: 'income', mode: 'today' }),
            transactionRepo.getTotalAmountByPeriod({ account_id, type: 'expense', mode: 'today' }),
            transactionRepo.getTotalAmountByPeriod({ account_id, type: 'income', mode: 'week' }),
            transactionRepo.getTotalAmountByPeriod({ account_id, type: 'expense', mode: 'week' }),
        ]);

        return {
            balance: totalBalance,
            income_day,
            expense_day,
            income_week,
            expense_week
        };
    } catch (error) {
        console.error('transaction.service.getTransactionSummaryBalance error:', error);
        throw error;
    }
};

const recalculateWalletAfterTransactionChange = async ({
    account_id,
    wallet_id,
    oldAmount = 0,
    oldType = null,
    newAmount = 0,
    newType = null,
}) => {
    try {
        if (!wallet_id) return; // Cannot update if no wallet_id

        // Lấy ví
        const wallet = await walletReposotory.getWalletById(wallet_id);

        if (!wallet) {
            console.error("[Wallet] Wallet not found for id:", wallet_id);
            // Should we throw? Or just log? Throwing might be safer to ensure consistency
            throw new Error("Wallet not found");
        }

        let balance = Number(wallet.balance ?? 0);

        // Gỡ giao dịch cũ (nếu có)
        if (oldType) {
            const delta = oldType === "income" ? -oldAmount : oldAmount;
            balance += delta;
        }

        // Áp dụng giao dịch mới (nếu có)
        if (newType) {
            const delta = newType === "income" ? newAmount : -newAmount;
            balance += delta;
        }

        // Cập nhật ví
        await walletReposotory.updateWalletBalance(account_id, wallet.id, balance);
    } catch (error) {
        console.error('transaction.service.recalculateWalletAfterTransactionChange error:', error);
        throw error;
    }
};



const linkTransactionToRecurring = async (params) => {
    try {
        await transactionRepo.linkTransactionToRecurring(params);
    } catch (error) {
        console.error('transaction.service.linkTransactionToRecurring error:', error);
        // Don't throw, just log. Or throw if critical? 
        // Throwing because controller handles it.
        throw error;
    }
};

module.exports = {
    createTransaction,
    getTransactionsByFilter,
    getTransactionsMonthlyChart,
    getTransactionById,
    getTransactionSummaryByAccount,
    updateTransaction,
    deleteTransaction,
    getTransactionSummaryBalance,
    createRecurringTransaction: transactionRepo.createRecurringTransaction,
    linkTransactionToRecurring
};