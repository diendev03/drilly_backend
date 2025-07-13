const profileRoute = require('./profile.route');
const accountRoute = require('./account.route');
const transactionCategoryRoute = require('./transaction_category.route');
const transactionRoute = require('./transaction.route');

const initRoutes = (app) => {
  app.use('/api/v1/user', profileRoute);
  app.use('/api/v1/user', accountRoute);
  app.use('/api/v1/transaction-category', transactionCategoryRoute);
  app.use('/api/v1/transaction', transactionRoute);
};

module.exports = initRoutes;