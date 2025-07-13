const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const transactionController = require('../controllers/transaction.controller');

// Tạo giao dịch
router.get('/summary', verifyToken, transactionController.getTransactionSummaryByAccount);
router.get('/', verifyToken, transactionController.filterTransactions);
router.post('/create', verifyToken, transactionController.createTransaction);
router.put('/update/:id', verifyToken, transactionController.updateTransaction);
router.get('/:id', verifyToken, transactionController.getTransactionById);
router.delete('/:id', verifyToken, transactionController.deleteTransaction);

module.exports = router;