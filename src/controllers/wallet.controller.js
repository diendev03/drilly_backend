const walletService = require('../services/wallet.service');
const { sendCreated, sendSuccess, sendFail, sendError } = require('../utils/response');

const createWallet = async (req, res) => {
    const { balance, name } = req.body || {};
    const account_id = req.account?.account_id;
    if (!account_id) {
        return sendFail(res, 'Invalid authentication token');
    }
    if (balance == null || isNaN(balance) || balance < 0) {
        return sendFail(res, 'Invalid wallet balance');
    }
    if (!name || name.trim() === '') {
        return sendFail(res, 'Wallet name is required');
    }
    try {
        const wallet = await walletService.createWallet(account_id, balance, name);
        sendCreated(res, "Wallet created successfully", wallet);
    } catch (error) {
        sendError(res, error);
    }
};

const getWalletByAccountId = async (req, res) => {
    const account_id = req.account?.account_id;
    if (!account_id) {
        return sendFail(res, 'Invalid authentication token');
    }
    try {
        const wallet = await walletService.getWalletByAccountId({ account_id });
        // Return success with null if no wallet found (new user)
        sendSuccess(res, wallet ? 'Wallet found' : 'No wallet yet', wallet);
    } catch (error) {
        sendError(res, error);
    }
};

const getAllWallets = async (req, res) => {
    const account_id = req.account?.account_id;
    if (!account_id) {
        return sendFail(res, 'Invalid authentication token');
    }
    try {
        const wallets = await walletService.getAllWalletsByAccountId({ account_id });
        sendSuccess(res, 'Wallets fetched successfully', wallets || []);
    } catch (error) {
        sendError(res, error);
    }
};


const updateWallet = async (req, res) => {
    const { wallet_id } = req.params;
    const { new_balance, name } = req.body;
    const account_id = req.account?.account_id;
    if (!account_id) {
        return sendFail(res, 'Invalid authentication token');
    }
    if (!wallet_id) {
        return sendFail(res, 'Invalid wallet ID');
    }
    if (new_balance != null && (isNaN(new_balance) || new_balance < 0)) {
        return sendFail(res, 'Invalid wallet balance');
    }
    try {
        const wallet = await walletService.updateWallet(account_id, wallet_id, new_balance, name);
        if (wallet) {
            sendSuccess(res, `Wallet ${wallet_id} by user ${account_id} with new balance ${new_balance} updated successfully`, {});
        } else {
            sendFail(res, 'Wallet not found');
        }
    } catch (error) {
        sendError(res, error);
    }
};

const deleteWallet = async (req, res) => {
    const { wallet_id } = req.params;
    const account_id = req.account?.account_id;
    if (!account_id) {
        return sendFail(res, 'Invalid authentication token');
    }
    if (!wallet_id) {
        return sendFail(res, 'Invalid wallet ID');
    }
    try {
        await walletService.deleteWallet(account_id, wallet_id);
        sendSuccess(res, "Wallet deleted successfully", {});
    } catch (error) {
        sendError(res, error);
    }
};

const getTotalBalance = async (req, res) => {
    const account_id = req.account?.account_id;
    if (!account_id) {
        return sendFail(res, 'Invalid authentication token');
    }
    try {
        const total_balance = await walletService.getTotalBalanceByAccountId(account_id);
        sendSuccess(res, 'Total balance fetched successfully', { total_balance });
    } catch (error) {
        sendError(res, error);
    }
};

module.exports = {
    createWallet,
    getWalletByAccountId,
    getAllWallets,
    updateWallet,
    deleteWallet,
    getTotalBalance
};
