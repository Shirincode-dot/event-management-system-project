-- ==========================================
-- EMS DATABASE RESET SCRIPT (SAFE VERSION)
-- ==========================================

CREATE DATABASE IF NOT EXISTS event_management_db;
USE event_management_db;

-- 1. DISABLE CHECKS TO ALLOW RESET
SET FOREIGN_KEY_CHECKS = 0;

-- 2. DROP TABLES
DROP TABLE IF EXISTS Guests;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS Events;
DROP TABLE IF EXISTS Venues;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS Users;

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- TABLE CREATION
-- ==========================================

-- 3. USERS TABLE
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'client'
);

-- 4. ADMINS TABLE
CREATE TABLE admins (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. VENUES TABLE
CREATE TABLE Venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    capacity INT
);

-- 6. EVENTS TABLE
CREATE TABLE Events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    venue_id INT,
    organizer_user_id INT,
    ticket_price DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (venue_id) REFERENCES Venues(venue_id),
    FOREIGN KEY (organizer_user_id) REFERENCES Users(user_id)
);

-- 7. BOOKINGS TABLE
CREATE TABLE Bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending',
    UNIQUE KEY (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (event_id) REFERENCES Events(event_id)
);

-- 8. GUESTS TABLE
CREATE TABLE Guests (
    guest_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    special_requests TEXT,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE
);

-- ==========================================
-- DATA INSERTION
-- ==========================================

-- 9. CREATE ADMIN USER
INSERT INTO admins (username, password_hash, role) 
VALUES ('admin', '$2b$10$qW3GEM29glMN4pn1I9SnVO2ZABWuqyHRWwPt9Yl4XjnFaVua6YdBq', 'admin');

-- 10. CREATE ORGANIZER
INSERT INTO Users (username, password_hash, role) 
VALUES ('DubaiEventsHost', 'placeholder', 'client');

SET @organizer_id = LAST_INSERT_ID();

-- 11. VENUES
INSERT INTO Venues (name, address, capacity) VALUES 
('Dubai Marina Yacht Club', 'Dubai Marina - Pier 7', 150),
('Burj Khalifa', '1 Sheikh Mohammed bin Rashid Blvd', 100),
('Dubai Creek Harbour', 'Ras Al Khor - The Viewing Point', 2000),
('Expo City Dubai', 'Al Wasl Plaza', 3000),
('Dubai World Trade Centre (GITEX)', 'Sheikh Zayed Rd', 7000);

-- 12. EVENTS
INSERT INTO Events (title, description, event_date, venue_id, organizer_user_id, ticket_price) VALUES 
('Luxury Sunset Yacht Cruise', 'Experience the marina skyline from a private luxury yacht. Includes dinner.', '2026-01-15 17:00:00', 1, @organizer_id, 500.00),
('VIP Burj Khalifa Sky Tour', 'Exclusive access to Level 148 with private refreshments.', '2026-02-20 10:00:00', 2, @organizer_id, 300.00),
('Marshmello Live: Creek Harbour Nights', 'An electrifying night with the world-famous DJ under the stars.', '2026-03-12 21:00:00', 3, @organizer_id, 2500.00),
('Mega Zumba Marathon 2026', 'Get fit at Al Wasl Plaza with 3000 other fitness enthusiasts.', '2026-04-05 08:00:00', 4, @organizer_id, 250.00),
('GITEX: New Samsung Galaxy Unpacked', 'Be the first to see the future of mobile technology.', '2026-10-10 11:00:00', 5, @organizer_id, 150.00);