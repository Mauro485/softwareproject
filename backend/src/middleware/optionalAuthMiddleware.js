const jwt = require('jsonwebtoken');

const optionalAuthMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    // If no token, continue as guest
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.slice(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');

    // Attach user info to req.user if valid
    req.user = decoded;

    next();
  } catch (error) {
    // Token exists but is invalid - continue as guest
    // In production, you might want to log this
    next();
  }
};

module.exports = optionalAuthMiddleware;
