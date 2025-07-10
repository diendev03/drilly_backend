const profileRoute = require('./profile.route');
const accountRoute = require('./account.route');
const transactionCategoryRoute = require('./transaction_category.route');

const initRoutes = (app) => {
  app.use('/api/v1/user', profileRoute);
  app.use('/api/v1/user', accountRoute);
  app.use('/api/v1/transaction-category', transactionCategoryRoute);
};

module.exports = initRoutes;