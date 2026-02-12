require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'drilly_db',
    port: process.env.DB_PORT || 3306,
};

const setupFeatures = async () => {
    let connection;
    try {
        console.log('🔌 Connecting to database...', dbConfig.database);
        connection = await mysql.createConnection(dbConfig);

        // 1. Create features table
        console.log('🛠️ Creating features table...');
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS features (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon_url VARCHAR(255),
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // 2. Create user_features table
        console.log('🛠️ Creating user_features table...');
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_features (
        user_id INT NOT NULL,
        feature_id VARCHAR(50) NOT NULL,
        enabled BOOLEAN DEFAULT false,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, feature_id),
        FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES account(id) ON DELETE CASCADE
      )
    `);

        // 3. Seed default features
        console.log('🌱 Seeding default features...');
        await connection.execute(`
      INSERT INTO features (id, name, icon_url, description, is_active)
      VALUES (
        'transaction_management',
        'Quản lý chi tiêu',
        'https://cdn-icons-png.flaticon.com/512/2344/2344132.png',
        'Theo dõi và quản lý chi tiêu cá nhân hiệu quả',
        true
      )
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        icon_url = VALUES(icon_url),
        description = VALUES(description),
        is_active = VALUES(is_active)
    `);

        console.log('✅ Feature setup completed successfully!');
    } catch (error) {
        console.error('❌ Error setting up features:', error);
    } finally {
        if (connection) await connection.end();
    }
};

setupFeatures();
