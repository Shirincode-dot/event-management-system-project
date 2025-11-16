// routes/adminAuth.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Your database connection
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Ensure you use the secret key loaded via dotenv
const jwtSecret = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 1. Basic Input Validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // 2. Fetch User from Database (Must be 'admin')
        const [users] = await pool.query(
            'SELECT user_id, password_hash, role FROM Users WHERE username = ? AND role = "admin"', 
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = users[0];

        // 3. Compare Password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 4. Generate and Issue JWT Token
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            jwtSecret, 
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // 5. Success Response
        res.json({ 
            message: 'Login successful.',
            token, 
            user_id: user.user_id,
            role: user.role 
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});
module.exports = router;