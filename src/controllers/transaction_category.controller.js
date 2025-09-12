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
        if (!req.account) {
            return sendError(res, 401, 'Unauthorized');
        }
        const account_id = req.account.account_id;
        const categories = await transactionService.getAllCategories({ account_id });
        return sendSuccess(res, 'Success', categories);
    } catch (error) {
        sendError(res, error);
    }
};

const getCategoriesByOwner = async (req, res) => {
    try {
        if (!req.account) {
            return sendError(res, 401, 'Unauthorized');
        }
        const account_id = req.account.account_id;
        const categories = await transactionService.getCategoriesByOwner({account_id});
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
    const { name, icon} = req.body;

    if (!id) return sendFail(res, 'Thiếu ID danh mục');

    if (!name && !icon) {
      return sendFail(res, 'Không có thông tin cập nhật');
    }

   const result = await transactionService.updateCategory(id, { name,icon });

    return sendSuccess(res, 'Updated successfully', result);
  } catch (error) {
    sendError(res, error);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const account_id = req.account?.account_id;
    const { id } = req.params;

    if (!id) return sendFail(res, 'Thiếu ID danh mục');
    if (!account_id) return sendFail(res, 'Thiếu account_id');

    const result = await transactionService.deleteCategory({ account_id, id });

    return sendSuccess(res, 'Xóa thành công', result);
  } catch (error) {
    sendError(res, error.message || 'Lỗi hệ thống');
  }
};



module.exports = {
    createCategory,
    getAllCategories,
    getCategoriesByOwner,
    searchCategory,
    updateCategory,
    deleteCategory
};