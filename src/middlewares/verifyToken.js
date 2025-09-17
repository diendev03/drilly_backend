const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Thiếu hoặc sai định dạng token xác thực' });
  }
    console.error('verify token:',authHeader);

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.account = decoded; // { account_id, email, ... }
    next();
  } catch (error) {
    return res.status(403).json({status: false, message: 'Token không hợp lệ', error: error.message });
  }
};


module.exports = verifyToken;