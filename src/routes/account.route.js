const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');

// Tạo user
router.post('/user', accountController.createUser);

// Đăng nhập
router.post('/user/login', accountController.login);

// Quên mật khẩu
router.post('/auth/forgot-password', accountController.forgotPasswordHandler);

module.exports = router;