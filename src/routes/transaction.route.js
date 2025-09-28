const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const transactionController = require('../controllers/transaction.controller');

// Tạo giao dịch// 🔹 Tổng quan / thống kê
router.get('/summary', verifyToken, transactionController.getTransactionSummaryByAccount);
router.get('/summary-balance', verifyToken, transactionController.getTransactionSummaryBalance);
router.get('/monthly-chart',verifyToken,transactionController.getTransactionsMonthlyChart);

// 🔹 CRUD cơ bản
router.get('/', verifyToken, transactionController.getTransactionByFilter);
router.get('/:id', verifyToken, transactionController.getTransactionById);
router.post('/create', verifyToken, transactionController.createTransaction);
router.put('/update/:id', verifyToken, transactionController.updateTransaction);
router.delete('/:id', verifyToken, transactionController.deleteTransaction);


module.exports = router;