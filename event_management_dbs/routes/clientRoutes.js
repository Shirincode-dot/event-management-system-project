// routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); 
const { verifyToken } = require('../middleware/auth');

// public routes (no token needed)

router.get('/events', async (req, res) => {
    try {
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

router.get('/events/:event_id/availability', async (req, res) => {
    const { event_id } = req.params;
    try {
        const [eventDetails] = await pool.query(`
            SELECT e.event_id, v.capacity
            FROM Events e
            JOIN Venues v ON e.venue_id = v.venue_id
            WHERE e.event_id = ?
        `, [event_id]);

        if (eventDetails.length === 0) return res.status(404).json({ message: "Event not found" });

        const capacity = eventDetails[0].capacity;
        const [countResult] = await pool.query(`SELECT COUNT(*) AS booked FROM Bookings WHERE event_id = ?`, [event_id]);
        const booked = countResult[0].booked;
        const available = capacity - booked;

        res.json({
            event_id,
            capacity,
            booked,
            available,
            status: available > 0 ? "Available" : "Sold Out"
        });
    } catch (err) {
        console.error("Availability check error:", err);
        res.status(500).json({ message: "Server error while checking availability" });
    }
});

// protected routes (token needed)

//get user bookings
router.get('/my-bookings', verifyToken, async (req, res) => {
    const user_id = req.user.id || req.user.user_id;

     console.log("Fetching bookings for User ID:", user_id); // debugging line

    try {
        const query = `
            SELECT 
                b.booking_id, 
                b.booking_date, 
                b.status,
                e.title AS event_title,
                e.event_date,
                e.ticket_price,
                v.name AS venue_name,
                v.address AS venue_address
            FROM Bookings b
            JOIN Events e ON b.event_id = e.event_id
            JOIN Venues v ON e.venue_id = v.venue_id
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


// create booking
router.post('/bookings', verifyToken, async (req, res) => {
    const { event_id } = req.body;
    const user_id = req.user.id || req.user.user_id;

    if (!event_id) return res.status(400).json({ message: "event_id is required" });

    try {
        // check event existence
        const [eventDetails] = await pool.query(`
            SELECT e.event_id, e.event_date, v.capacity
            FROM Events e
            JOIN Venues v ON e.venue_id = v.venue_id
            WHERE e.event_id = ?
        `, [event_id]);
        if (eventDetails.length === 0) return res.status(404).json({ message: "Event does not exist" });

        const eventDate = eventDetails[0].event_date;
        const capacity = eventDetails[0].capacity;

        // checking capacity
        const [countBookings] = await pool.query(`SELECT COUNT(*) AS booked FROM Bookings WHERE event_id = ?`, [event_id]);
        if (countBookings[0].booked >= capacity) return res.status(400).json({ message: "Event is fully booked" });

        // checking dupes
        const [duplicate] = await pool.query(`SELECT * FROM Bookings WHERE user_id = ? AND event_id = ?`, [user_id, event_id]);
        if (duplicate.length > 0) return res.status(409).json({ message: "You already booked this event" });

        // create
        await pool.query(`INSERT INTO Bookings (user_id, event_id, booking_date, status) VALUES (?, ?, NOW(), 'Pending')`, [user_id, event_id]);
        res.status(201).json({ message: "Booking successful" });

    } catch (err) {
        console.error("Create booking error:", err);
        res.status(500).json({ message: "Server error during booking" });
    }
});

// cancel booking
router.put('/bookings/:id/cancel', verifyToken, async (req, res) => {
    const user_id = req.user.id || req.user.user_id;
    try {
        // ensure user owns booking before cancelling
        const query = 'UPDATE Bookings SET status = "Cancelled" WHERE booking_id = ? AND user_id = ?';
        const [result] = await pool.query(query, [req.params.id, user_id]);

        if (result.affectedRows === 0) return res.status(403).json({ message: "Cannot cancel this booking (Access Denied or Not Found)" });
        
        res.json({ message: "Booking cancelled" });
    } catch (error) {
        console.error("Cancel error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// guest management route

router.get('/bookings/:bookingId/guests', verifyToken, async (req, res) => {
    const user_id = req.user.id || req.user.user_id;
    try {
        // security check: ensure this booking belongs to the user that is logged in
        const [booking] = await pool.query('SELECT user_id FROM Bookings WHERE booking_id = ?', [req.params.bookingId]);
        
        if (!booking.length || booking[0].user_id !== user_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const [guests] = await pool.query('SELECT * FROM Guests WHERE booking_id = ?', [req.params.bookingId]);
        res.json(guests);
    } catch (error) {
        console.error("Get guests error:", error);
        res.status(500).json({ message: 'Error fetching guests' });
    }
});

router.post('/bookings/:bookingId/guests', verifyToken, async (req, res) => {
    const { fullName, email, requests } = req.body;
    const user_id = req.user.id || req.user.user_id;
    
    try {
        // security check
        const [booking] = await pool.query('SELECT user_id FROM Bookings WHERE booking_id = ?', [req.params.bookingId]);
        if (!booking.length || booking[0].user_id !== user_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await pool.query(
            'INSERT INTO Guests (booking_id, full_name, email, special_requests) VALUES (?, ?, ?, ?)',
            [req.params.bookingId, fullName, email, requests]
        );
        res.json({ message: 'Guest added' });
    } catch (error) {
        console.error("Add guest error:", error);
        res.status(500).json({ message: 'Error adding guest' });
    }
});

module.exports = router;