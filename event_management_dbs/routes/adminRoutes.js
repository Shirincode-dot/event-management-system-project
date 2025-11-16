// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Your MySQL connection pool
const { verifyToken, isAdmin } = require('../middleware/auth'); // Your JWT security middleware

// --- ADMIN SECURE ROUTES GO HERE ---

// Example: Secured route to view all users (Needs implementation in Step 3)
// router.get('/users', verifyToken, async (req, res) => { ... });



// POST /api/admin/venues - Add a new venue
router.post('/venues', verifyToken, async (req, res) => {
    const { name, address, capacity } = req.body;

    // Basic input validation
    if (!name || !capacity) {
        return res.status(400).json({ message: 'Venue name and capacity are required.' });
    }
    
    // Ensure capacity is a valid number
    if (isNaN(parseInt(capacity))) {
        return res.status(400).json({ message: 'Capacity must be a number.' });
    }

    try {
        const query = 'INSERT INTO Venues (name, address, capacity) VALUES (?, ?, ?)';
        const [result] = await pool.query(query, [name, address || null, capacity]);

        res.status(201).json({ 
            message: 'Venue created successfully.', 
            venue_id: result.insertId,
            name,
            capacity
        });
    } catch (error) {
        console.error('Error creating venue:', error);
        res.status(500).json({ message: 'Server error while creating venue.' });
    }
});
// GET /api/admin/venues - Get all venues
router.get('/venues', verifyToken, async (req, res) => {
    try {
        const query = 'SELECT venue_id, name, address, capacity FROM Venues ORDER BY name';
        const [venues] = await pool.query(query);

        res.json(venues);
    } catch (error) {
        console.error('Error fetching venues:', error);
        res.status(500).json({ message: 'Server error while fetching venues.' });
    }
});

// GET /api/admin/users - Get all users (for admin dashboard overview)
router.get('/users', verifyToken, async (req, res) => {
    try {
        // Only select non-sensitive columns
        const query = 'SELECT user_id, username, role FROM Users ORDER BY user_id DESC';
        const [users] = await pool.query(query);

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error while fetching users.' });
    }
});
// GET /api/admin/bookings - Get all bookings with user and event details
router.get('/bookings', verifyToken, async (req, res) => {
    try {
        // Use JOINs to link Bookings to Usernames and Event Titles
        const query = `
            SELECT 
                b.booking_id, 
                b.booking_date, 
                b.status AS booking_status,
                u.username AS client_username,
                e.title AS event_title,
                e.event_date
            FROM Bookings b
            JOIN Users u ON b.user_id = u.user_id
            JOIN Events e ON b.event_id = e.event_id
            ORDER BY b.booking_date DESC
        `;
        const [bookings] = await pool.query(query);

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error while fetching bookings.' });
    }
});
// PUT /api/admin/venues/:id - Update an existing venue
router.put('/venues/:id', verifyToken, async (req, res) => {
    const { name, address, capacity } = req.body;
    const { id } = req.params;

    // Ensure at least one field is provided for update
    if (!name && !address && !capacity) {
        return res.status(400).json({ message: 'At least one field (name, address, or capacity) must be provided for update.' });
    }

    // Build the query dynamically based on provided fields
    let updates = [];
    let values = [];
    
    if (name) { updates.push('name = ?'); values.push(name); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address || null); }
    if (capacity !== undefined) { updates.push('capacity = ?'); values.push(capacity); }

    if (values.length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    values.push(id); // Add the venue ID to the end of the values array

    try {
        const query = `UPDATE Venues SET ${updates.join(', ')} WHERE venue_id = ?`;
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Venue not found or no changes made.' });
        }

        res.json({ message: `Venue ID ${id} updated successfully.` });
    } catch (error) {
        console.error(`Error updating venue ${id}:`, error);
        res.status(500).json({ message: 'Server error while updating venue.' });
    }
});
// DELETE /api/admin/venues/:id - Delete a venue
router.delete('/venues/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        // NOTE: In a production system, you would check for dependencies (e.g., existing events)
        // before deleting a venue. For now, we rely on MySQL's foreign key constraints 
        // which might block the deletion if an event uses this venue.
        
        const query = 'DELETE FROM Venues WHERE venue_id = ?';
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Venue not found.' });
        }

        res.json({ message: `Venue ID ${id} deleted successfully.` });
    } catch (error) {
        console.error(`Error deleting venue ${id}:`, error);
        // Error code 1451 is the default for foreign key violation
        if (error.code === 'ER_ROW_IS_REFERENCED_2') { 
            return res.status(409).json({ message: 'Cannot delete venue because it is linked to existing events.' });
        }
        res.status(500).json({ message: 'Server error while deleting venue.' });
    }
});
router.post('/events', verifyToken, isAdmin, async (req, res) => {
    // Note: event_date should be a YYYY-MM-DD string
    const { title, description, event_date, venue_id, ticket_price } = req.body;

    // Basic Input Validation
    if (!title || !event_date || !venue_id || !ticket_price) {
        return res.status(400).json({ message: 'Title, date, venue ID, and price are required.' });
    }

    try {
        const query = `
            INSERT INTO Events 
            (title, description, event_date, venue_id, ticket_price) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [
            title, 
            description || null, // Allow description to be optional/null
            event_date, 
            venue_id, 
            ticket_price
        ]);

        res.status(201).json({ 
            message: 'Event created successfully.', 
            event_id: result.insertId,
            title,
            venue_id 
        });
    } catch (error) {
        console.error('Error creating event:', error);

        // Check for specific foreign key constraint error (Venue ID doesn't exist)
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             return res.status(400).json({ message: 'Invalid venue_id: The venue does not exist.' });
        }

        res.status(500).json({ message: 'Server error while creating event.' });
    }
});
router.put('/events/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, description, event_date, venue_id, ticket_price } = req.body;

    // Build the query dynamically based on provided fields
    let updates = [];
    let values = [];
    
    // Check which fields are provided in the request body
    if (title) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description || null); }
    if (event_date) { updates.push('event_date = ?'); values.push(event_date); }
    if (venue_id) { updates.push('venue_id = ?'); values.push(venue_id); }
    if (ticket_price !== undefined) { updates.push('ticket_price = ?'); values.push(ticket_price); }

    // If no fields were provided, stop and return an error
    if (values.length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    values.push(id); // Add the event ID to the end of the values array for the WHERE clause

    try {
        const query = `UPDATE Events SET ${updates.join(', ')} WHERE event_id = ?`;
        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found or no changes made.' });
        }

        res.json({ message: `Event ID ${id} updated successfully.` });
    } catch (error) {
        console.error(`Error updating event ${id}:`, error);

        // Check for specific foreign key constraint error (Venue ID doesn't exist)
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             return res.status(400).json({ message: 'Invalid venue_id: The venue does not exist.' });
        }
        
        res.status(500).json({ message: 'Server error while updating event.' });
    }
});
router.delete('/events/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        // NOTE: If you implemented cascading deletes on your Bookings table, 
        // this will also delete related bookings. If not, MySQL will block 
        // the deletion if related bookings exist (ER_ROW_IS_REFERENCED_2).
        
        const query = 'DELETE FROM Events WHERE event_id = ?';
        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        res.json({ message: `Event ID ${id} deleted successfully.` });
    } catch (error) {
        console.error(`Error deleting event ${id}:`, error);
        
        // Error code 1451 is the default for foreign key violation
        if (error.code === 'ER_ROW_IS_REFERENCED_2') { 
            return res.status(409).json({ message: 'Cannot delete event because it has existing bookings or dependencies.' });
        }
        res.status(500).json({ message: 'Server error while deleting event.' });
    }
});
router.get('/events', verifyToken, isAdmin, async (req, res) => {
    try {
        // Query the database to select all columns from the Events table
        const [events] = await pool.query('SELECT * FROM Events ORDER BY event_date DESC');
        
        // Return the array of events
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error while fetching events.' });
    }
});
router.get('/events/schema', verifyToken, isAdmin, async (req, res) => {
    try {
        // SQL query to describe the table structure
        const [fields] = await pool.query('DESCRIBE Events');
        
        // Return only the column names
        const columnNames = fields.map(field => field.Field);
        
        res.json(columnNames);
    } catch (error) {
        console.error('Error fetching table schema:', error);
        res.status(500).json({ message: 'Server error fetching schema.' });
    }
});
module.exports = router;