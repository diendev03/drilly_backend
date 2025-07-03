const profileRoute = require('./profile.route');
const accountRoute = require('./account.route');

const initRoutes = (app) => {
  app.use('/api/v1/user', profileRoute);
  app.use('/api/v1/user', accountRoute);
};

module.exports = initRoutes;