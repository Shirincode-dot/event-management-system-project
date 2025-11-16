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


// -----------------------------------------------------------
// CHECK REAL-TIME EVENT AVAILABILITY
// GET /api/client/events/:event_id/availability
// -----------------------------------------------------------
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

// ============================
// 2. PROTECTED ROUTES (require verifyToken)
// ============================

// -----------------------------------------------------------
// GET ALL BOOKINGS FOR CLIENT
// GET /api/client/bookings
// -----------------------------------------------------------
router.get('/bookings', verifyToken, async (req, res) => {
    const user_id = req.user.user_id; 
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

// -----------------------------------------------------------
// GET SINGLE BOOKING DETAILS
// GET /api/client/bookings/:booking_id
// -----------------------------------------------------------
router.get('/bookings/:booking_id', verifyToken, async (req, res) => {
    const { booking_id } = req.params;
    const user_id = req.user.user_id;
    try {
        const [details] = await pool.query(`
            SELECT 
                b.booking_id,
                b.booking_date,
                b.status,
                e.title,
                e.description,
                e.event_date,
                e.ticket_price,
                v.name AS venue,
                v.address
            FROM Bookings b
            JOIN Events e ON b.event_id = e.event_id
            JOIN Venues v ON e.venue_id = v.venue_id
            WHERE b.booking_id = ? AND b.user_id = ?
        `, [booking_id, user_id]);

        if (details.length === 0) return res.status(404).json({ message: "Booking not found" });

        res.json(details[0]);
    } catch (err) {
        console.error("Single booking fetch error:", err);
        res.status(500).json({ message: "Server error fetching booking details" });
    }
});

// -----------------------------------------------------------
// CREATE BOOKING
// POST /api/client/bookings
// -----------------------------------------------------------
router.post('/bookings', verifyToken, async (req, res) => {
    const { event_id } = req.body;
    const user_id = req.user.user_id;

    if (!event_id) return res.status(400).json({ message: "event_id is required" });

    try {
        // Check event exists + capacity
        const [eventDetails] = await pool.query(`
            SELECT e.event_id, e.event_date, v.capacity
            FROM Events e
            JOIN Venues v ON e.venue_id = v.venue_id
            WHERE e.event_id = ?
        `, [event_id]);
        if (eventDetails.length === 0) return res.status(404).json({ message: "Event does not exist" });

        const eventDate = eventDetails[0].event_date;
        const capacity = eventDetails[0].capacity;

        if (new Date(eventDate) < new Date()) return res.status(400).json({ message: "Cannot book past events" });

        const [countBookings] = await pool.query(`SELECT COUNT(*) AS booked FROM Bookings WHERE event_id = ?`, [event_id]);
        if (countBookings[0].booked >= capacity) return res.status(400).json({ message: "Event is fully booked" });

        const [duplicate] = await pool.query(`SELECT * FROM Bookings WHERE user_id = ? AND event_id = ?`, [user_id, event_id]);
        if (duplicate.length > 0) return res.status(409).json({ message: "You already booked this event" });

        const [conflict] = await pool.query(`
            SELECT b.booking_id
            FROM Bookings b
            JOIN Events e ON b.event_id = e.event_id
            WHERE b.user_id = ? AND e.event_date = ?
        `, [user_id, eventDate]);
        if (conflict.length > 0) return res.status(409).json({ message: "You already have another event at the same time" });

        await pool.query(`INSERT INTO Bookings (user_id, event_id, booking_date, status) VALUES (?, ?, NOW(), 'confirmed')`, [user_id, event_id]);
        res.status(201).json({ message: "Booking successful" });

    } catch (err) {
        console.error("Create booking error:", err);
        res.status(500).json({ message: "Server error during booking" });
    }
});

// -----------------------------------------------------------
// UPDATE BOOKING (reschedule/status)
// PUT /api/client/bookings/:booking_id
// -----------------------------------------------------------
router.put('/bookings/:booking_id', verifyToken, async (req, res) => {
    const { booking_id } = req.params;
    const { new_event_id, status } = req.body;
    const user_id = req.user.user_id;

    try {
        const [existing] = await pool.query(`SELECT * FROM Bookings WHERE booking_id = ? AND user_id = ?`, [booking_id, user_id]);
        if (existing.length === 0) return res.status(404).json({ message: "Booking not found for this user" });

        if (new_event_id) {
            const [eventDetails] = await pool.query(`
                SELECT e.event_date, v.capacity
                FROM Events e
                JOIN Venues v ON e.venue_id = v.venue_id
                WHERE e.event_id = ?
            `, [new_event_id]);
            if (eventDetails.length === 0) return res.status(400).json({ message: "Invalid event" });

            const capacity = eventDetails[0].capacity;
            const eventDate = eventDetails[0].event_date;

            const [countBookings] = await pool.query(`SELECT COUNT(*) AS booked FROM Bookings WHERE event_id = ?`, [new_event_id]);
            if (countBookings[0].booked >= capacity) return res.status(400).json({ message: "Event is fully booked" });

            const [duplicateCheck] = await pool.query(`SELECT * FROM Bookings WHERE user_id = ? AND event_id = ?`, [user_id, new_event_id]);
            if (duplicateCheck.length > 0) return res.status(409).json({ message: "You already booked this event" });

            // Check for schedule conflict with any *other* existing booking
            const [conflict] = await pool.query(`
                SELECT b.booking_id
                FROM Bookings b
                JOIN Events e ON b.event_id = e.event_id
                WHERE b.user_id = ? AND e.event_date = ? AND b.booking_id != ?
            `, [user_id, eventDate, booking_id]); 

            if (conflict.length > 0) return res.status(409).json({ message: "Schedule conflict with another event" });

            await pool.query(`UPDATE Bookings SET event_id = ? WHERE booking_id = ?`, [new_event_id, booking_id]);
        }

        if (status) {
            await pool.query(`UPDATE Bookings SET status = ? WHERE booking_id = ?`, [status, booking_id]);
        }

        res.json({ message: "Booking updated successfully" });

    } catch (err) {
        console.error("Update booking error:", err);
        res.status(500).json({ message: "Server error while updating booking" });
    }
});

// -----------------------------------------------------------
// DELETE BOOKING (cancel)
// DELETE /api/client/bookings/:booking_id
// -----------------------------------------------------------
router.delete('/bookings/:booking_id', verifyToken, async (req, res) => {
    const { booking_id } = req.params;
    const user_id = req.user.user_id;

    try {
        const [result] = await pool.query(`DELETE FROM Bookings WHERE booking_id = ? AND user_id = ?`, [booking_id, user_id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Booking not found or not owned by user" });

        res.json({ message: "Booking cancelled successfully" });
    } catch (err) {
        console.error("Delete booking error:", err);
        res.status(500).json({ message: "Server error during booking cancellation" });
    }
});

module.exports = router;