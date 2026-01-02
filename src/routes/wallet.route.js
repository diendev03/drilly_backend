const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const verifyToken = require('../middlewares/verifyToken');

router.post('/', verifyToken, walletController.createWallet);
router.get('/', verifyToken, walletController.getWalletByAccountId);
router.get('/all', verifyToken, walletController.getAllWallets);
router.get('/balance', verifyToken, walletController.getTotalBalance);
router.put('/:wallet_id', verifyToken, walletController.updateWallet);
router.delete('/:wallet_id', verifyToken, walletController.deleteWallet);

module.exports = router;
