// middleware/auth.js

const jwt = require('jsonwebtoken');

// 1. JWT Verification Middleware
const verifyToken = (req, res, next) => {
    // Get token from the Authorization header (Bearer <token>)
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied: No token provided.' });
    }

    // Extract the token part
    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach decoded user info (user_id, role) to the request object
        req.user = decoded; 
        
        next(); // Token is valid, proceed to the next middleware or route handler

    } catch (error) {
        // Token is invalid, expired, or corrupted
        return res.status(403).json({ message: 'Access denied: Invalid or expired token.' });
    }
};


// 2. Admin Role Check Middleware (NEW)
const isAdmin = (req, res, next) => {
    // This assumes req.user was populated by the verifyToken middleware above.
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin, proceed!
    } else {
        // User is authenticated but not an admin (or role is missing)
        res.status(403).json({ message: 'Access denied: Requires admin privileges.' });
    }
};


// 3. Export both functions (UPDATED)
module.exports = {
    verifyToken,
    isAdmin // 
}