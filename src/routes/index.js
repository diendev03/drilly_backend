const profileRoute = require('./profile.route');
const accountRoute = require('./account.route');
const transactionCategoryRoute = require('./transaction_category.route');
const transactionRoute = require('./transaction.route');
const transactionReportRoute = require('./transaction_report.route');
const walletRoute = require('./wallet.route');
const conversationRoute = require('./conversation.route');
const messageRoute = require('./message.route');
const followRoute = require('./follow.route');
const blockRoute = require('./block.route');
const notificationRoute = require('./notification.route');

const initRoutes = (app) => {
  app.use('/api/v1/user', profileRoute);
  app.use('/api/v1/user', accountRoute);
  app.use('/api/v1/transaction-category', transactionCategoryRoute);
  app.use('/api/v1/transaction', transactionRoute);
  app.use('/api/v1/transaction-report', transactionReportRoute);
  app.use('/api/v1/wallet', walletRoute);
  app.use('/api/v1/conversation', conversationRoute);
  app.use('/api/v1/message', messageRoute);
  app.use('/api/v1/follow', followRoute);
  app.use('/api/v1/block', blockRoute);
  app.use('/api/v1/notifications', notificationRoute);
};

module.exports = initRoutes;