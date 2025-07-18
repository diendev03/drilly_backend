const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const verifyToken = require('../middlewares/verifyToken');


// Tạo user
router.post('/create', accountController.createUser);

// Đăng nhập
router.post('/login', accountController.login);

// Quên mật khẩu
router.post('/forgot-password', accountController.forgotPasswordHandler);

// Đổi mật khẩu
router.post('/change-password', verifyToken, accountController.changePasswordHandler);

module.exports = router;