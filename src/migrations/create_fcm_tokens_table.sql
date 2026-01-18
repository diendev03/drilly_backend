-- FCM Tokens Migration Script
-- Creates table for storing FCM device tokens

CREATE TABLE IF NOT EXISTS fcm_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  fcm_token VARCHAR(512) NOT NULL,
  platform ENUM('android', 'ios', 'web') NOT NULL DEFAULT 'android',
  device_id VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  UNIQUE INDEX idx_fcm_token (fcm_token),
  INDEX idx_user_id (user_id),
  INDEX idx_user_active (user_id, is_active),
  
  -- Foreign key (optional - uncomment if accounts table exists)
  -- CONSTRAINT fk_fcm_user FOREIGN KEY (user_id) REFERENCES accounts(account_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger for soft delete cleanup (optional)
-- Run periodically to remove old inactive tokens
-- DELETE FROM fcm_tokens WHERE is_active = 0 AND updated_at < NOW() - INTERVAL 30 DAY;
