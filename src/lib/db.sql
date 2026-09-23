CREATE DATABASE IF NOT EXISTS tech_meetup;
USE tech_meetup;

CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registrationOpen BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  age INT NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  has_attended_tech_event BOOLEAN NOT NULL,
  interest_area VARCHAR(50) NOT NULL,
  level TEXT NOT NULL,
  wants_to_present BOOLEAN NOT NULL,
  presentation_contact TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- مثال رمز ادمین (می‌توانید بعداً تغییر دهید)
INSERT INTO settings (id, registrationOpen, created_at) 
VALUES (1, true, NOW()) 
ON DUPLICATE KEY UPDATE registrationOpen = registrationOpen;