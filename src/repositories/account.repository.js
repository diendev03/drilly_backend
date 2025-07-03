const accountModel = require('../models/account.model');

const createAccountInDB = async (email, password) => {
    return await accountModel.createAccount({ email, password });
};

const getAccountByEmail = async (email) => {
    return await accountModel.findAccountByEmail(email);
};

const getAccountById = async (account_id) => {
    console.log("🔍repo Tìm account theo ID: %s", account_id);
    return await accountModel.findAccountById(account_id);
};

const changePassword = async (account_id, newPassword) => {
    return await accountModel.changePassword(account_id, newPassword);
};

module.exports = {
    createAccountInDB,
    getAccountByEmail,
    getAccountById,
    changePassword,
};