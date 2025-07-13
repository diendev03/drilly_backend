const accountRepository = require('../repositories/account.repository');
const { sendMail } = require('../utils/mailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Tạo mới tài khoản
const createUser = async ({ name, email, password }) => {
  const existing = await accountRepository.getAccountByEmail(email);
  if (existing) throw new Error('Email đã tồn tại');

  const hashed = await bcrypt.hash(password, 10);
  return await accountRepository.createAccount({ email, password: hashed });
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

  const token = jwt.sign(
    { account_id: account.id, email: account.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return token;
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
  changePassword
};