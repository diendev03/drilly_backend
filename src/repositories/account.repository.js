const { createAccount, findAccountByEmail } = require('../models/account.model');

const createAccountInDB = async (email, password) => {
  return await createAccount({ email, password });
};

const getAccountByEmail = async (email) => {
  return await findAccountByEmail(email);
};

module.exports = {
  createAccountInDB,
  getAccountByEmail,
};