require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');   // <-- ADD THIS
const app = express();
const PORT = 3001; 
const tempRegisterRouter = require('./routes/tempRegister');

// Routers
const clientAuthRouter = require('./routes/ClientAuth');
const clientRoutesRouter = require('./routes/clientRoutes');
const adminAuthRoutes = require('./routes/adminAuth'); 
const adminRoutes = require('./routes/adminRoutes');

// DB connection
require('./db');

// --- MIDDLEWARE ---
app.use(cors());    // <-- AND ADD THIS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/temp', tempRegisterRouter);

// --- ROUTES ---

// Test route
app.get('/', (req, res) => {
    res.send('Event Management Backend is running!');
});

// Admin login/logout
app.use('/api/admin', adminAuthRoutes);

// Admin secured CRUD routes
app.use('/api/admin', adminRoutes);

// Client routes
app.use('/api/client', clientRoutesRouter);

// Client auth
app.use('/api/auth', clientAuthRouter);

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
