const { sendSuccess, sendFail, sendError } = require('../utils/response');
const transactionReportService = require('../services/transaction_report.service');

const getReportSummary = async (req, res) => {
  try {
    if (!req.account) {
      return sendFail(res, 401, 'Unauthorized');
    }

    const account_id = req.account.account_id;
    const report_summary = await transactionReportService.getReportSummary({ account_id });

    if (!report_summary) {
      return sendFail(res, 404, 'Cannot find your report');
    }

    sendSuccess(res, 'Successfully', report_summary);
  } catch (error) {
    console.error('❌ Error in getReportSummary:', error);
    sendError(res, 500, 'Internal server error');
  }
};
const getSummaryByCategory = async (req, res) => {
  try {
    if (!req.account) {
      return sendFail(res, 401, 'Unauthorized');
    }

    const account_id = req.account.account_id;
    const result = await transactionReportService.getSummaryByCategory({ account_id});

    if (!result) {
      return sendFail(res, 404, 'Cannot find your report');
    }

    sendSuccess(res, 'Successfully', result);
  } catch (error) {
    console.error('❌ Error in getReportSummary:', error);
    sendError(res, 500, 'Internal server error');
  }
};

module.exports = { getReportSummary, getSummaryByCategory };
