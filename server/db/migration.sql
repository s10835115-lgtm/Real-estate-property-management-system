-- Migration script to add platform governance columns and tables

USE real_estate_pm;

-- 1. Add columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended TINYINT(1) DEFAULT 0;

-- 2. Add columns to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(255) DEFAULT NULL;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS removed_by_admin TINYINT(1) DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL;

-- 3. Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Create flagged_listings table
CREATE TABLE IF NOT EXISTS flagged_listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id INT NOT NULL,
  property_id INT NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'reviewed', 'dismissed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_flagged_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_flagged_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);
