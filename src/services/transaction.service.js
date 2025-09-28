const transactionRepo = require('../repositories/transaction.repository');
const walletReposotory = require('../repositories/wallet.repository');

const createTransaction = async ({ account_id, type, category, amount, note, date, image_url }) => {
    const transaction = await transactionRepo.createTransaction({ account_id, type, category, amount, note, date, image_url });

    await recalculateWalletAfterTransactionChange({
        account_id,
        oldAmount: 0,
        oldType: null,
        newAmount: Number(amount),
        newType: type,
    });

    return transaction;
};

const getTransactionsByFilter= async ({
  account_id,
  start_date,
  end_date,
  type,
  categories,
  limit,
  offset
}) => {
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
};

const getTransactionsMonthlyChart = async ({
    account_id
}) => {
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

const updateTransaction = async ({ id, account_id, amount, note, type }) => {
    const oldTransaction = await transactionRepo.getTransactionById({ account_id, id });
    if (!oldTransaction) throw new Error("Transaction not found");

    const updated = await transactionRepo.updateTransaction({ id, account_id, amount, note, type });

    await recalculateWalletAfterTransactionChange({
        account_id,
        oldAmount: Number(oldTransaction.amount),
        oldType: oldTransaction.type,
        newAmount: Number(amount),
        newType: type,
    });

    return updated;
};


const deleteTransaction = async ({ id, account_id }) => {
    const oldTransaction = await transactionRepo.getTransactionById({ account_id, id });
    if (!oldTransaction) throw new Error("Transaction not found");

    const deleted = await transactionRepo.deleteTransaction({ id, account_id });

    await recalculateWalletAfterTransactionChange({
        account_id,
        oldAmount: Number(oldTransaction.amount),
        oldType: oldTransaction.type,
        newAmount: 0,
        newType: null,
    });

    return deleted;
};



const getTransactionSummaryBalance = async ({ account_id }) => {
    const [balance, income_day, expense_day, income_week, expense_week] = await Promise.all([
        walletReposotory.getWalletByAccountId({ account_id }),
        transactionRepo.getTotalAmountByPeriod({ account_id, type: 'income', mode: 'today' }),
        transactionRepo.getTotalAmountByPeriod({ account_id, type: 'expense', mode: 'today' }),
        transactionRepo.getTotalAmountByPeriod({ account_id, type: 'income', mode: 'week' }),
        transactionRepo.getTotalAmountByPeriod({ account_id, type: 'expense', mode: 'week' }),
    ]);

    return {
        balance: balance?.balance ?? 0,
        income_day,
        expense_day,
        income_week,
        expense_week
    };
};

const recalculateWalletAfterTransactionChange = async ({
  account_id,
  oldAmount = 0,
  oldType = null,
  newAmount = 0,
  newType = null,
}) => {
  console.log("===== Wallet Recalculation =====");
  console.log("Account ID:", account_id);
  console.log("Old Transaction →", { oldAmount, oldType });
  console.log("New Transaction →", { newAmount, newType });

  // Lấy ví
  const wallet = await walletReposotory.getWalletByAccountId({ account_id });

  if (!wallet || !wallet.id) {
    console.error("[Wallet] Wallet not found for account:", account_id);
    throw new Error("Wallet not found");
  }

  let balance = Number(wallet.balance ?? 0);
  console.log("Current Wallet Balance:", balance);

  // Gỡ giao dịch cũ (nếu có)
  if (oldType) {
    const delta = oldType === "income" ? -oldAmount : oldAmount;
    console.log(`[Wallet] Reversing old ${oldType} → Δ = ${delta}`);
    balance += delta;
  }

  // Áp dụng giao dịch mới (nếu có)
  if (newType) {
    const delta = newType === "income" ? newAmount : -newAmount;
    console.log(`[Wallet] Applying new ${newType} → Δ = ${delta}`);
    balance += delta;
  }

  console.log(`[Wallet] Final Calculated Balance: ${balance}`);

  // Cập nhật ví
  await walletReposotory.updateWalletBalance(account_id, wallet.id, balance);

  console.log(`[Wallet] ✅ Balance updated successfully`);
  console.log("================================\n");
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
};