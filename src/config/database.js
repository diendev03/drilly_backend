const mysql = require('mysql2/promise');
require('dotenv').config();

let connection;

const initDB = async () => {
  try {
    connection = await mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0
    });

    // Thử một truy vấn đơn giản để kiểm tra kết nối
    await connection.query('SELECT 1');
    console.log('✅ Kết nối DB thành công (Promise)!');

    return connection;
  } catch (error) {
    console.error('❌ Kết nối DB thất bại (Promise):', error.message);
    process.exit(1); // thoát app nếu DB không kết nối được
  }
};

// Khởi tạo và export kết nối ngay
module.exports = initDB();
