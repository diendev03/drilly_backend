const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const transactionReportController = require('../controllers/transaction_report.controller');

router.get('/summary', verifyToken, transactionReportController.getReportSummary);
router.get('/summary-category', verifyToken, transactionReportController.getSummaryByCategory);


module.exports = router;