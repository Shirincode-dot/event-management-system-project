// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// middleware to protect routes
// code block below checks if the user sending the request has a valid Admin Token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token.' });
        
        // check if the token role is actually admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        req.user = user;
        next();
    });
};

// login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // checking 'admins' table
        const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        const admin = rows[0];

        // compare password
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // create Token
        const token = jwt.sign(
            { id: admin.user_id, role: 'admin' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '4h' }
        );

        res.json({ message: 'Login successful', token, username: admin.username });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// dashboard routes

// GET /api/admin/bookings - Get all bookings
router.get('/bookings', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT 
                b.booking_id as id, 
                b.booking_date, 
                b.status,
                u.username AS clientName,
                v.name AS venueName,
                e.event_date as date,
                v.capacity as totalGuests 
            FROM Bookings b
            JOIN Users u ON b.user_id = u.user_id
            JOIN Events e ON b.event_id = e.event_id
            JOIN Venues v ON e.venue_id = v.venue_id
            ORDER BY b.booking_date DESC
        `;
        const [bookings] = await db.query(query);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT Approve/Reject Booking
router.put('/bookings/:id/:action', verifyToken, async (req, res) => {
    const { id, action } = req.params;
    const status = action === 'approve' ? 'Approved' : 'Rejected';

    try {
        await db.query('UPDATE Bookings SET status = ? WHERE booking_id = ?', [status, id]);
        res.json({ message: `Booking ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
});

// venue management
// GET all venues
router.get('/venues', verifyToken, async (req, res) => {
    try {
        const [venues] = await db.query('SELECT * FROM Venues ORDER BY name');
        res.json(venues);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching venues.' });
    }
});

// POST new venue
router.post('/venues', verifyToken, async (req, res) => {
    const { name, address, capacity } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO Venues (name, address, capacity) VALUES (?, ?, ?)', 
            [name, address, capacity]
        );
        res.status(201).json({ message: 'Venue created', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating venue.' });
    }
});

// user management

router.get('/users', verifyToken, async (req, res) => {
    try {
        const [users] = await db.query('SELECT user_id, username, role FROM Users ORDER BY user_id DESC');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users.' });
    }
});

module.exports = router;