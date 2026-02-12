const accountService = require('../services/account.service');
const { sendCreated, sendFail, sendError, sendSuccess } = require('../utils/response');

// ✅ Tạo tài khoản
const createUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return sendFail(res, 'Thiếu thông tin bắt buộc (name, email, phone, password)');
    }

    const user = await accountService.createUser({ name, email, phone, password });
    return sendCreated(res, 'Tạo tài khoản thành công', user);
  } catch (error) {
    if (error.message.includes('Email đã tồn tại')) {
      return sendFail(res, error.message);
    }
    return sendError(res, 'Lỗi server', error);
  }
};

// ✅ Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await accountService.login({ email, password });
    // result = { access_token, refresh_token, account_id }

    // Set HttpOnly Cookies
    console.log("Setting HttpOnly Cookies... (NODE_ENV=" + process.env.NODE_ENV + ")");
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', result.access_token, {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: isProduction ? 'None' : 'Lax', // 'None' for cross-origin in production
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return sendSuccess(res, 'Đăng nhập thành công', result);
  } catch (error) {
    // Return specific error messages from service
    if (error.message.includes('không tồn tại') ||
      error.message.includes('không chính xác') ||
      error.message.includes('Vui lòng nhập')) {
      return sendFail(res, error.message);
    }
    return sendError(res, 'Lỗi server', error);
  }
};


// ✅ Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return sendFail(res, 'Thiếu refresh token');

    const result = await accountService.refreshToken({ refresh_token });
    // result = { accessToken, refreshToken mới }

    return sendSuccess(res, 'Làm mới token thành công', result);
  } catch (error) {
    if (error.message.includes('không hợp lệ') || error.message.includes('hết hạn')) {
      return sendFail(res, error.message);
    }
    return sendError(res, 'Lỗi server', error);
  }
};




// ✅ Quên mật khẩu
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendFail(res, 'Email là bắt buộc');

    const result = await accountService.forgotPassword(email);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('không tồn tại')) {
      return sendFail(res, error.message, false);
    }
    return sendError(res, 'Lỗi server', error, false);
  }
};

// ✅ Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const account_id = req.account?.account_id;
    const { old_password, new_password } = req.body;

    const result = await accountService.changePassword({ account_id, old_password, new_password });
    if (!result.success) return sendFail(res, result.message, false);

    return sendSuccess(res, "Change password success!", true);
  } catch (error) {
    return sendError(res, 'Lỗi server', error, false);
  }
};


module.exports = {
  createUser,
  login,
  forgotPassword,
  changePassword,
  refreshToken
};