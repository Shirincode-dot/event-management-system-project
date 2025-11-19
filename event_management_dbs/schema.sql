-- schema.sql file for euphoria events

-- database and tables setup

CREATE DATABASE IF NOT EXISTS event_management_db;
USE event_management_db;

-- users table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('client', 'admin') NOT NULL
);

-- venues table
CREATE TABLE Venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    capacity INT
);

-- events table
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

-- booking table
CREATE TABLE Bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
    UNIQUE KEY (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (event_id) REFERENCES Events(event_id)
);

-- admin table
CREATE TABLE admins (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============
-- seeding data
-- ===============

-- create admin
INSERT INTO admins (username, password_hash, role) 
VALUES ('admin', '$2b$10$w09tJ/77O/9/90W5j/18o.jY7J6Xk9Xh/0k.X', 'admin');

-- create organizer user
INSERT INTO Users (username, password_hash, role) 
VALUES ('DubaiEventsCo', 'hash123', 'client');

-- capture id of user
SET @organizer_id = LAST_INSERT_ID();

-- create venues
INSERT INTO Venues (name, address, capacity) VALUES 
('Dubai Opera', 'Sheikh Mohammed bin Rashid Blvd - Downtown Dubai', 2000),
('Dubai World Trade Centre (DWTC)', 'Sheikh Zayed Rd - Trade Centre 2', 15000),
('Coca-Cola Arena', 'City Walk - Al Wasl', 17000),
('Alserkal Avenue', '17th St - Al Quoz 1', 500),
('Atlantis The Royal', 'Crescent Rd - Palm Jumeirah', 800);

-- create events
INSERT INTO Events (title, description, event_date, venue_id, organizer_user_id, ticket_price) VALUES 
('Future Tech Summit 2026', 'The region\'s largest gathering of AI and Robotics experts.', '2026-11-15 09:00:00', 2, @organizer_id, 299.00),
('The Phantom of the Opera', 'The award-winning musical returns to the heart of Downtown.', '2026-12-05 20:00:00', 1, @organizer_id, 550.00),
('Dubai Summer Concert Series', 'Beat the heat with live performances from international stars.', '2026-07-20 19:00:00', 3, @organizer_id, 195.50),
('Contemporary Art Week', 'A showcase of local artists, indie films, and workshops.', '2026-10-10 10:00:00', 4, @organizer_id, 50.00),
('Royal Gala Dinner', 'An exclusive black-tie networking evening at the Palm.', '2026-09-12 20:30:00', 5, @organizer_id, 1200.00);