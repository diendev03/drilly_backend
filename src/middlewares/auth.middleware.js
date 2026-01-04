const verifyToken = require('./verifyToken');

const authMiddleware = verifyToken;

module.exports = { authMiddleware };
