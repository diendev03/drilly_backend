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

const searchCategory = async (req, res) => {
    try {
        const { keyword } = req.query;
        const categories = await transactionService.searchCategory({ keyword });
        return sendSuccess(res, 'Success', categories);
    } catch (error) {
        sendError(res, error);
    }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, icon, color } = req.body;

    if (!id) return sendFail(res, 'Thiếu ID danh mục');

    if (!name && !type && !icon && !color) {
      return sendFail(res, 'Không có thông tin cập nhật');
    }

   const result = await transactionService.updateCategory(id, { name, type, icon, color });

    return sendSuccess(res, 'Updated successfully', result);
  } catch (error) {
    sendError(res, error);
  }
};


module.exports = {
    createCategory,
    getAllCategories,
    searchCategory,
    updateCategory
};