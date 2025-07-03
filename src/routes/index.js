const profileRoute = require('./profile.route');
const accountRoute = require('./account.route');

const initRoutes = (app) => {
  app.use('/api/v1', profileRoute);
  app.use('/api/v1', accountRoute);
};

module.exports = initRoutes;