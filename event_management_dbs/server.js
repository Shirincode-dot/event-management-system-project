require('dotenv').config();
// server.js
const express = require('express');
const app = express();
const PORT = 3001; 

// ❗ IMPORTANT: This line establishes your database connection from db.js
require('./db'); 

// Middleware: Allows Express to parse JSON data from incoming requests
app.use(express.json()); 

// ➡️ Placeholder for routes (will be implemented next)
// const authRoutes = require('./routes/auth');
// app.use('/api/auth', authRoutes);

// Simple route to check if the server is running
app.get('/', (req, res) => {
    res.send('Event Management Backend is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});