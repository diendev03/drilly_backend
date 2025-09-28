const reportRepo = require('../repositories/transaction_report.repository');
const walletRepo = require('./wallet.service');

const getReportSummary = async ({ account_id }) => {
  const summary = await reportRepo.getReportSummary({ account_id });
  const balance = await walletRepo.getWalletByAccountId({account_id});
  return {
    ...summary,
    balance: balance.balance ?? 0,
  };
};

const getSummaryByCategory = async({account_id})=>{
const result = await reportRepo.getSummaryByCategory({account_id});
return result;
}
module.exports = {
  getReportSummary,
  getSummaryByCategory
};
