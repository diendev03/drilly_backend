const accountService = require('../services/account.service');
const { sendCreated, sendFail, sendError } = require('../utils/response');

// ✅ Tạo tài khoản
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendFail(res, 'Thiếu thông tin bắt buộc');
    }

    const user = await accountService.createUser({ name, email, password });
    return sendCreated(res, 'Tạo tài khoản thành công', user);
  } catch (error) {
    if (error.message.includes('Email đã tồn tại')) {
      return sendFail(res, error.message);
    }
    console.error('❌ Lỗi khi tạo tài khoản:', error.message, error.stack);
    return sendError(res, 'Lỗi server', error);
  }
};

// ✅ Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendFail(res, 'Thiếu email hoặc mật khẩu');

    const result = await accountService.login({ email, password });
    return sendCreated(res, 'Đăng nhập thành công', result);
  } catch (error) {
    if (error.message.includes('không tồn tại') || error.message.includes('không chính xác')) {
      return sendFail(res, error.message);
    }
    return sendError(res, 'Lỗi server', error);
  }
};

// ✅ Quên mật khẩu
const forgotPasswordHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendFail(res, 'Email là bắt buộc');

    const result = await accountService.forgotPassword(email);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('không tồn tại')) {
      return sendFail(res, error.message);
    }
    return sendError(res, 'Lỗi server', error);
  }
};

// ✅ Đổi mật khẩu
const changePasswordHandler = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
const account_id = req.headers['account_id'];  
    if (!account_id?.trim()) {
      return sendFail(res, 'Thiếu account_id trong header');
    }
    if (!old_password) {
      return sendFail(res, 'Thiếu thông tin mật khẩu cũ');
    }
    if (!new_password) {
      return sendFail(res, 'Thiếu thông tin mật khẩu mới');
    }

    const result = await accountService.changePassword({
      account_id: account_id,
      old_password: old_password,
      new_password: new_password
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Lỗi khi đổi mật khẩu:', error.message, error.stack);
    return sendError(res, 'Lỗi server', error);
  }
};

module.exports = {
  createUser,
  login,
  forgotPasswordHandler,
  changePasswordHandler
};