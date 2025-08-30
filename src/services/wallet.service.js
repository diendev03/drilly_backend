const walletRepository=require('../repositories/wallet.repository');

const createWallet = async (account_id, balance) => {
    try {
        const wallet = await walletRepository.createWallet(account_id, balance);
        return wallet;
    } catch (error) {
        throw new Error('Error creating wallet');
    }
};

const getWalletByAccountId = async (accountId) => {
    try {
        const wallet = await walletRepository.getWalletByAccountId(accountId);
        return wallet;
    } catch (error) {
        throw new Error('Error fetching wallet');
    }
};

const getWalletByWalletId = async (accountId, wallet_id) => {
    try {
        const wallet = await walletRepository.getWalletById(accountId, wallet_id);
        return wallet;
    } catch (error) {
        throw new Error('Error fetching wallet');
    }
};

const updateWalletBalance = async (account_id, wallet_id, new_balance) => {
    try {
        const wallet = await walletRepository.updateWalletBalance(account_id, wallet_id, new_balance);
        return wallet;
    } catch (error) {
        throw new Error('Error updating wallet balance');
    }
};

const deleteWallet = async (account_id,wallet_id) => {
    try {
        await walletRepository.deleteWalletByAccountId(account_id,wallet_id);
    } catch (error) {
        throw new Error('Error deleting wallet');
    }
};

module.exports = {
    createWallet,
    getWalletByAccountId,
    getWalletByWalletId,
    updateWalletBalance,
    deleteWallet
};
