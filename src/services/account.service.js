const accountRepository = require('../repositories/account.repository');
const profileRepository = require('../repositories/profile.repository');
const { sendMail } = require('../utils/mailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateTokens } = require('../utils/token');

// Tạo mới tài khoản
const createUser = async ({ name, email, password }) => {
  const existing = await accountRepository.getAccountByEmail(email);
  if (existing) throw new Error('Email đã tồn tại');

  const hashed = await bcrypt.hash(password, 10);
  const account = await accountRepository.createAccount({ email, password: hashed });
  const profile = await profileRepository.createProfile({
    account_id: account.id, name: name, email: email
  });
  if (!profile) throw new Error('Không thể tạo profile');
  const { password: _, ...safeAccount } = account;
  return safeAccount;
};

// Lấy account theo email
const findUserByEmail = async (email) => {
  return await accountRepository.getAccountByEmail(email);
};

// Đăng nhập
const login = async ({ email, password }) => {
  const account = await findUserByEmail(email);
  if (!account) throw new Error('Tài khoản không tồn tại');

  const ok = await bcrypt.compare(password, account.password);
  if (!ok) throw new Error('Mật khẩu không chính xác');

  const payload = { account_id: account.id, email: account.email };
  
  const tokens = generateTokens(payload); // { accessToken, refreshToken }

  // Lưu refresh token vào DB để quản lý
  // await accountRepository.saveRefreshToken(account.id, tokens.refreshToken);
console.log('token: $tokens');
  return tokens;
};

//Refresh token
const refreshToken = async ({ refresh_token }) => {
  // Kiểm tra token có trong DB không
  const stored = await accountRepository.findRefreshToken(refresh_token);
  if (!stored) throw new Error('Refresh token không hợp lệ');

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const payload = { account_id: decoded.account_id, email: decoded.email };
    const tokens = generateTokens(payload);

    // Rotate refresh token (xóa cũ, lưu mới)
    // await accountRepository.updateRefreshToken(decoded.account_id, tokens.refreshToken);

    return tokens;
  } catch (err) {
    throw new Error('Refresh token hết hạn hoặc không hợp lệ');
  }
};



// Quên mật khẩu
const forgotPassword = async (email) => {
  const account = await getAccountByEmail(email);
  if (!account) throw new Error('Email không tồn tại');

  const resetToken = jwt.sign(
    { account_id: account.id, email: account.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

  await sendMail({
    to: account.email,
    subject: 'Yêu cầu đặt lại mật khẩu',
    html: `
      <p>Bạn vừa yêu cầu đặt lại mật khẩu.</p>
      <a href="${resetLink}">Đặt lại mật khẩu</a>
      <p>Link hết hạn sau 15 phút.</p>
    `,
  });

  return { message: 'Đã gửi email khôi phục mật khẩu' };
};

// Đổi mật khẩu
const changePassword = async ({ account_id, old_password, new_password }) => {

  const account = await accountRepository.getAccountById(account_id);
  if (!account) throw new Error('Tài khoản không tồn tại');

  const ok = await bcrypt.compare(old_password, account.password);
  if (!ok) throw new Error('Mật khẩu cũ không chính xác');

  const hashed = await bcrypt.hash(new_password, 10);
  return await accountRepository.changePassword(account_id, hashed);
};


module.exports = {
  createUser,
  findUserByEmail,
  login,
  forgotPassword,
  changePassword,
  refreshToken
};