const walletRepository = require('../repositories/wallet.repository');

const createWallet = async (account_id, balance, name) => {
    try {
        const wallet = await walletRepository.createWallet(account_id, balance, name);
        return wallet;
    } catch (error) {
        throw error;
    }
};

const getWalletByAccountId = async ({ account_id }) => {
    try {
        const wallet = await walletRepository.getWalletByAccountId({ account_id });
        return wallet;
    } catch (error) {
        throw new Error('Error fetching wallet');
    }
};

const updateWallet = async (account_id, wallet_id, new_balance, name) => {
    // Check if wallet exists
    const existingWallet = await walletRepository.getWalletByAccountId({ account_id });
    // Note: getWalletByAccountId returns THE first wallet, not specific by ID. This logic in service seems flawed if used for updates by ID.
    // However, repository update query uses ID. Let's trust repository call.

    // We should probably check if the specific wallet belongs to user, but current service just passes through.

    await walletRepository.updateWallet(account_id, wallet_id, new_balance, name);
    return { id: wallet_id, balance: new_balance, name };
};

const deleteWallet = async (account_id, wallet_id) => {
    try {
        await walletRepository.deleteWalletByAccountId(account_id, wallet_id);
    } catch (error) {
        throw new Error('Error deleting wallet');
    }
};

const getTotalBalanceByAccountId = async (account_id) => {
    try {
        const totalBalance = await walletRepository.getTotalBalanceByAccountId(account_id);
        return totalBalance;
    } catch (error) {
        throw new Error('Error fetching total balance');
    }
};

const getAllWalletsByAccountId = async ({ account_id }) => {
    try {
        const wallets = await walletRepository.getAllWalletsByAccountId({ account_id });
        return wallets;
    } catch (error) {
        throw new Error('Error fetching wallets');
    }
};

module.exports = {
    createWallet,
    getWalletByAccountId,
    getAllWalletsByAccountId,
    updateWallet,
    deleteWallet,
    getTotalBalanceByAccountId
};
