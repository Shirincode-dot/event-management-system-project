// db.js
const mysql = require('mysql2');

// Configure the connection pool
const pool = mysql.createPool({
    host: 'localhost',      
    user: 'root',           // The default MySQL username
    password: 'Tiger@123', // ⬅️ 🚨 CRITICAL: REPLACE WITH YOUR PASSWORD
    database: 'event_management_db', // The name of the database you created
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- CONNECTION TEST ---
// This test runs when the server starts to confirm the connection is active.
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed. Check credentials/server status:', err.message);
        process.exit(1); 
    }
    console.log('✅ Successfully connected to MySQL Database!');
    connection.release(); 
});
// -----------------------

// Export the pool so other files (routes) can execute queries using async/await
module.exports = pool.promise();