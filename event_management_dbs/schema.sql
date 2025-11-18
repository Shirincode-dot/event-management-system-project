-- schema.sql file for Event Management System

-- 1. Database Creation
CREATE DATABASE IF NOT EXISTS event_management_db;
USE event_management_db;

-- 2. Create Core Tables
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('client', 'admin') NOT NULL
);

CREATE TABLE Venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    capacity INT
);

CREATE TABLE Events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    venue_id INT,
    organizer_user_id INT
);

-- 3. Define Relationships (Foreign Keys)
ALTER TABLE Events
ADD CONSTRAINT fk_events_venue
FOREIGN KEY (venue_id) REFERENCES Venues(venue_id);

ALTER TABLE Events
ADD CONSTRAINT fk_events_organizer
FOREIGN KEY (organizer_user_id) REFERENCES Users(user_id);
-- 4. Create Bookings/Attendees Table
CREATE TABLE Bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,            -- The user who made the booking
    event_id INT NOT NULL,           -- The event being booked
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
    
    -- Ensure a user can only book a seat for the same event once
    UNIQUE KEY (user_id, event_id)
);

-- 5. Define Relationships for Bookings

-- Link Bookings to Users
ALTER TABLE Bookings
ADD CONSTRAINT fk_booking_user
FOREIGN KEY (user_id) REFERENCES Users(user_id);

-- Link Bookings to Events
ALTER TABLE Bookings
ADD CONSTRAINT fk_booking_event
FOREIGN KEY (event_id) REFERENCES Events(event_id);

CREATE TABLE admins (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
INSERT INTO admins (username, password_hash, role) 
VALUES ('admin', '$2b$10$w09tJ/77O/9/90W5j/18o.jY7J6Xk9Xh/0k.X', 'admin');
