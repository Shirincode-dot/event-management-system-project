// routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); 
const { verifyToken } = require('../middleware/auth');
// NOTE: No middleware like verifyToken is used here, 
// so these routes are accessible by anyone (guests or clients).

// -----------------------------------------------------------
// 1. GET ALL EVENTS (Public/Client View)
// GET /api/client/events
// -----------------------------------------------------------
router.get('/events', async (req, res) => {
    try {
        // We select key public information, including the venue name via JOIN
        const query = `
            SELECT 
                e.event_id, 
                e.title, 
                e.description, 
                e.event_date,
                e.ticket_price,
                v.name AS venue_name,
                v.address AS venue_address
            FROM Events e
            JOIN Venues v ON e.venue_id = v.venue_id
            ORDER BY e.event_date
        `;
        const [events] = await pool.query(query);
        
        res.json(events);
    } catch (error) {
        console.error('Error fetching public events:', error);
        res.status(500).json({ message: 'Server error while fetching events.' });
    }
});


// -----------------------------------------------------------
// 2. GET ALL VENUES (Public/Client View)
// GET /api/client/venues
// -----------------------------------------------------------
router.get('/venues', async (req, res) => {
    try {
        const query = 'SELECT venue_id, name, address, capacity FROM Venues ORDER BY name';
        const [venues] = await pool.query(query);

        res.json(venues);
    } catch (error) {
        console.error('Error fetching public venues:', error);
        res.status(500).json({ message: 'Server error while fetching venues.' });
    }
});
// 3. BOOKING CREATION (Protected Route)
// POST /api/client/bookings
// Requires client token via verifyToken
// -----------------------------------------------------------
router.post('/bookings', verifyToken, async (req, res) => {
    // The user_id is extracted from the JWT token via verifyToken middleware
    const user_id = req.user.user_id; 
    const { event_id } = req.body;

    // Basic Validation
    if (!event_id) {
        return res.status(400).json({ message: 'Event ID is required to make a booking.' });
    }

    try {
        // NOTE: In a real system, you would check for available ticket capacity here.
        
        const booking_date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const status = 'confirmed'; // Default status

        const query = 'INSERT INTO Bookings (user_id, event_id, booking_date, status) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(query, [user_id, event_id, booking_date, status]);

        res.status(201).json({
            message: 'Booking successfully created.',
            booking_id: result.insertId,
            event_id: event_id,
            user_id: user_id
        });

    } catch (error) {
        console.error('Booking creation error:', error);
        
        // Check for specific foreign key error (Event ID doesn't exist)
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             return res.status(400).json({ message: 'Invalid event_id: The event does not exist.' });
        }
        
        res.status(500).json({ message: 'Server error while creating booking.' });
    }
});
router.get('/bookings', verifyToken, async (req, res) => {
    // The user_id is extracted from the JWT token via verifyToken middleware
    const user_id = req.user.user_id; 

    try {
        // Use a JOIN to get event details, and filter by the authenticated user_id
        const query = `
            SELECT 
                b.booking_id, 
                b.booking_date, 
                e.title AS event_title,
                e.event_date,
                e.ticket_price
            FROM Bookings b
            JOIN Events e ON b.event_id = e.event_id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC
        `;
        const [bookings] = await pool.query(query, [user_id]);

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching client bookings:', error);
        res.status(500).json({ message: 'Server error while fetching client bookings.' });
    }
});

module.exports = router;