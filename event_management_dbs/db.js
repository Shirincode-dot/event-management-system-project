// db.js
const mysql = require('mysql2/promise');
require('dotenv').config; //bug fix - load password from .env

//configuring the connection pool
const pool = mysql.createPool({
    host: 'localhost',      
    user: 'root',           
    password: 'Days16byHerbert!',
    database: 'event_management_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// connection test (bug fix for promise API)
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed.', err.message);
        process.exit(1); 
    }
    console.log('Successfully connected to MySQL Database!');
    connection.release(); 
});
// -----------------------

// export pool so other files (routes) can execute queries using async/await
module.exports = pool;