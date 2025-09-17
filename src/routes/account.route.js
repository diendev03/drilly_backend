const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const verifyToken = require('../middlewares/verifyToken');


// Tạo user
router.post('/create', accountController.createUser);

// Đăng nhập
router.post('/login', accountController.login);

// Refresh token
router.post('/refresh-token', accountController.refreshToken);

// Quên mật khẩu
router.post('/forgot-password', accountController.forgotPassword);

// Đổi mật khẩu
router.post('/change-password', verifyToken, accountController.changePassword);

module.exports = router;