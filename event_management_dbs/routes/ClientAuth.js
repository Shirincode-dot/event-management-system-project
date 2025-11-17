// routes/clientAuth.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Role constant for easy reference
const CLIENT_ROLE = 'client';

// -----------------------------------------------------------
// 1. CLIENT REGISTRATION
// POST /api/auth/register
// -----------------------------------------------------------
router.post('/register', async (req, res) => {
    console.log("REGISTER ROUTE HIT");
    const { username, password } = req.body;

    // Basic Validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required for registration.' });
    }

    try {
        // Check if user already exists
        const [existingUser] = await pool.query('SELECT user_id FROM Users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Username already taken.' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new client user into the database
        const query = 'INSERT INTO Users (username, password_hash, role) VALUES (?, ?, ?)';
        const [result] = await pool.query(query, [username, hashedPassword, CLIENT_ROLE]);

        // Generate JWT Token for immediate login
        const token = jwt.sign(
            { user_id: result.insertId, username: username, role: CLIENT_ROLE },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.status(201).json({
            message: 'Client registration successful.',
            user_id: result.insertId,
            token: token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});


// -----------------------------------------------------------
// 2. CLIENT LOGIN
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Find the user in the database
        const query = 'SELECT user_id, username, password_hash, role FROM Users WHERE username = ?';
        const [users] = await pool.query(query, [username]);

        if (users.length === 0) {
            // Use a generic message for security
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = users[0];

        // Compare the provided password with the stored hash
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Check if the user is a client (optional, but good practice for clarity)
        if (user.role !== CLIENT_ROLE) {
             return res.status(403).json({ message: 'Access denied. Only client accounts can use this login endpoint.' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Client login successful.',
            token: token
        });

    } catch (error) {
        console.error('Client login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});
module.exports = router;