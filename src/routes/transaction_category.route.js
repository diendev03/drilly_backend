const express = require('express');
const router = express.Router();
const transactionCategoryController = require('../controllers/transaction_category.controller');
const verifyToken = require('../middlewares/verifyToken');

// Cập nhật danh mục giao dịch
router.get('/', verifyToken, transactionCategoryController.getAllCategories);
router.post('/create', verifyToken, transactionCategoryController.createCategory);

module.exports = router;