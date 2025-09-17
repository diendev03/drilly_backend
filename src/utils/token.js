const jwt = require('jsonwebtoken');

const generateTokens = (payload) => {

  const access_token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  const refresh_token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

  return { access_token, refresh_token };
};

module.exports = { generateTokens };
