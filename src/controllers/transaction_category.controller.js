const transactionService = require('../services/transaction_category.service');
const { sendSuccess, sendCreated, sendFail, sendError } = require('../utils/response');
const { SocketManager } = require('../sockets/socket.manager');
const SocketEvent = require('../sockets/socket.events');

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


        // 🔌 Socket.IO emit
        try {
            console.log(`[Socket] Emitting CATEGORY_CREATED to user ${owner_id}`, newCategory);
            SocketManager.emitToUser(owner_id, SocketEvent.CATEGORY_CREATED, newCategory);
        } catch (socketErr) {
            console.error('Socket emit failed:', socketErr);
        }

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
        const categories = await transactionService.getCategoriesByOwner({ account_id });
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
        const { name, icon } = req.body;

        if (!id) return sendFail(res, 'Thiếu ID danh mục');

        if (!name && !icon) {
            return sendFail(res, 'Không có thông tin cập nhật');
        }

        const result = await transactionService.updateCategory(id, { name, icon });
        const owner_id = req.account?.account_id;

        // 🔌 Socket.IO emit
        try {
            SocketManager.emitToUser(owner_id, SocketEvent.CATEGORY_UPDATED, { id, name, icon, ...result });
        } catch (socketErr) {
            console.error('Socket emit failed:', socketErr);
        }

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

        // 🔌 Socket.IO emit
        try {
            SocketManager.emitToUser(account_id, SocketEvent.CATEGORY_DELETED, { id });
        } catch (socketErr) {
            console.error('Socket emit failed:', socketErr);
        }

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