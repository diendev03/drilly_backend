const accountService = require('../services/account.service');
const { sendCreated, sendFail, sendError, sendSuccess } = require('../utils/response');

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
    return sendError(res, 'Lỗi server', error);
  }
};

// ✅ Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendFail(res, 'Thiếu email hoặc mật khẩu');

    const result = await accountService.login({ email, password }); 
    // result = { accessToken, refreshToken }

    return sendSuccess(res, 'Đăng nhập thành công', result);
  }  catch (error) {
  if (error.message.includes('không tồn tại') || error.message.includes('không chính xác')) {
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
 
    return sendSuccess(res,'Làm mới token thành công',result);
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
      return sendFail(res, error.message,false);
    }
    return sendError(res, 'Lỗi server', error,false);
  }
};

// ✅ Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const account_id = req.account?.account_id;
    const { old_password, new_password } = req.body;
    if (!account_id) return sendFail(res, 'Sai token xác thực',false);
    if (!old_password) return sendFail(res, 'Thiếu mật khẩu cũ',false);
    if (!new_password) return sendFail(res, 'Thiếu mật khẩu mới',false);

    const result = await accountService.changePassword({
      account_id: account_id,
      old_password: old_password,
      new_password: new_password
    });

    return sendSuccess(res,"Change password success!",result);
  } catch (error) {
    return sendError(res, 'Lỗi server', error,false);
  }
};

module.exports = {
  createUser,
  login,
  forgotPassword,
  changePassword,
  refreshToken
};