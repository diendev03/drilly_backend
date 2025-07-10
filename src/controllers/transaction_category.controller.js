const transactionService = require('../services/transaction_category.service');
const { sendSuccess, sendCreated, sendFail, sendError } = require('../utils/response');

const createCategory = async (req, res) => {
    try {
        const {
            name,
            type,
            icon,
            color,
        } = req.body;
        const owner_id = req.account?.account_id;
        if (!name || !type || !icon || !color || !owner_id) {
            return sendFail(res, 'Missing required fields');
        }
        const newCategory = await transactionService.createCategory({
            name,
            type,
            icon,
            color,
            owner_id,
        });

        return sendCreated(res, 'Created successfully', newCategory);
    } catch (error) {
        sendError(res, error);
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await transactionService.getAllCategories();
        return sendSuccess(res, 'Success', categories);
    } catch (error) {
        sendError(res, error);
    }
};
module.exports = {
    createCategory,
    getAllCategories
};  