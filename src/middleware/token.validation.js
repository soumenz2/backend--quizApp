const jwt = require('jsonwebtoken');
const config = require('../config');

const verifyToken = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ msg: 'No token provided' });
    }

    // Extract the token from the authorization header
    const token = authorization.split(' ')[1]; // Assuming the format is "Bearer <token>"
    
    if (!token) {
        return res.status(401).json({ msg: 'Token is missing or invalid' });
    }

    try {
        // Verify the token
        const verified = jwt.verify(token, config.secret);
        req.user = verified; // Attach the decoded token payload to req.user
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        // Handle any errors that occur during token verification
        return res.status(401).json({ msg: 'Invalid token', error: err.message });
    }
};

module.exports = verifyToken;
