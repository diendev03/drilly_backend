const walletRepository=require('../repositories/wallet.repository');

const createWallet = async (account_id, balance) => {
    try {
        const wallet = await walletRepository.createWallet(account_id, balance);
        return wallet;
    } catch (error) {
        throw new Error('Error creating wallet');
    }
};

const getWalletByAccountId = async ({account_id}) => {
    try {
        const wallet = await walletRepository.getWalletByAccountId({account_id});
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

const getTotalBalanceByAccountId = async (account_id) => {
    try {
        const totalBalance = await walletRepository.getTotalBalanceByAccountId(account_id);
        return totalBalance;
    } catch (error) {
        throw new Error('Error fetching total balance');
    }
};

module.exports = {
    createWallet,
    getWalletByAccountId,
    updateWalletBalance,
    deleteWallet,
    getTotalBalanceByAccountId
};
