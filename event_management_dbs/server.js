require('dotenv').config({ path: './.env' });;
const cors = require('cors'); //added cors to fix blocked connection by browser
const express = require('express');
const app = express();
const PORT = 3001; 
const clientAuthRouter = require('./routes/clientAuth');
const clientRoutesRouter = require('./routes/clientRoutes');
// ❗ IMPORTANT: This line establishes your database connection from db.js
require('./db'); 

// Middleware: Allows Express to parse JSON data from incoming requests
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'] 
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- ROUTE IMPORTS ---
// You need to define adminAuthRoutes here before app.use()
const adminAuthRoutes = require('./routes/adminAuth'); 
const adminRoutes = require('./routes/adminRoutes');


// --- ROUTES ---

// Simple check
app.get('/', (req, res) => {
    res.send('Event Management Backend is running!');
});

// Use the admin and client authentication routes for login/logout
app.use('/api/admin', adminRoutes); 
app.use('/api/client', clientRoutesRouter);
// Use the secured admin CRUD routes
app.use('/api/admin', adminRoutes);

app.use('/api/auth', clientAuthRouter);

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});