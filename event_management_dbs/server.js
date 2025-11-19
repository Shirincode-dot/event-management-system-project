require('dotenv').config();
const cors = require('cors'); 
const express = require('express');
const app = express();
const PORT = 3001; 

// import db (run connection test)
require('./db'); 

// middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'] 
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// route imports
const clientAuthRouter = require('./routes/clientAuth');
const clientRoutesRouter = require('./routes/clientRoutes');
const adminRoutes = require('./routes/adminRoutes');

// routes config

// home check
app.get('/', (req, res) => {
    res.send('Event Management Backend is running!');
});

// client auth (login/register)
app.use('/api/auth', clientAuthRouter);

// client events and booking
app.use('/api', clientRoutesRouter);

// admin routes (login + dashboard)
app.use('/api/admin', adminRoutes); 

// start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});