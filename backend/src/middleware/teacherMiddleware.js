const authMiddleware = require('./authMiddleware');

// Middleware to check if user is authenticated and is a teacher
const teacherMiddleware = (req, res, next) => {
  // First verify authentication
  authMiddleware(req, res, () => {
    // Check if user role is teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Forbidden - Only teachers can perform this action' });
    }
    next();
  });
};

module.exports = teacherMiddleware;
