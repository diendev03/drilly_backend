/**
 * Run this script to create follow/block/notifications tables
 * Usage: node migrations/run_migration.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const migration = `
-- Bảng Follow (user A follow user B)
CREATE TABLE IF NOT EXISTS user_follow (
  id INT PRIMARY KEY AUTO_INCREMENT,
  follower_id INT NOT NULL,
  following_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_follow (follower_id, following_id),
  INDEX idx_follower (follower_id),
  INDEX idx_following (following_id),
  FOREIGN KEY (follower_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Bảng Block
CREATE TABLE IF NOT EXISTS user_block (
  id INT PRIMARY KEY AUTO_INCREMENT,
  blocker_id INT NOT NULL,
  blocked_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_block (blocker_id, blocked_id),
  INDEX idx_blocker (blocker_id),
  INDEX idx_blocked (blocked_id),
  FOREIGN KEY (blocker_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Bảng Notification
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('follow', 'message', 'system') NOT NULL,
  title VARCHAR(200),
  body TEXT,
  data JSON,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_created (created_at),
  FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE
);
`;

async function runMigration() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        console.log('✅ Connected to database');

        await connection.query(migration);

        console.log('✅ Migration completed successfully!');
        console.log('   - Created table: user_follow');
        console.log('   - Created table: user_block');
        console.log('   - Created table: notifications');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runMigration();
