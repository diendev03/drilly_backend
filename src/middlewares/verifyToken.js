 const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Thiếu token xác thực' });

  const token = authHeader.split(' ')[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ message: 'Token không hợp lệ' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.account = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token không hợp lệ', error: error.message });
  }
};

module.exports = verifyToken;