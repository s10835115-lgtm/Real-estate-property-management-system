USE real_estate_pm;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS suspension_reason VARCHAR(255) NULL;

ALTER TABLE properties
  MODIFY COLUMN availability ENUM('available', 'booked', 'sold', 'rented') NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS removal_reason VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS deleted_by INT NULL,
  ADD COLUMN IF NOT EXISTS view_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS enquiry_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS save_count INT NOT NULL DEFAULT 0;

ALTER TABLE bookings
  MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'cancelled', 'rescheduled') NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reschedule_date DATE NULL,
  ADD COLUMN IF NOT EXISTS reschedule_time TIME NULL,
  ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(255) NULL;

CREATE TABLE IF NOT EXISTS enquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  sender_id INT NULL,
  sender_name VARCHAR(120) NOT NULL,
  sender_email VARCHAR(160) NOT NULL,
  sender_phone VARCHAR(40),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_enquiries_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  CONSTRAINT fk_enquiries_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
