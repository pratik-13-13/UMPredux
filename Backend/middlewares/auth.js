

const jwt = require('jsonwebtoken');
const {User} = require('../models/User');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    // ✅ FIXED: Handle both 'id' and '_id' from JWT
    req.user = {
      _id: decoded._id || decoded.id,  // Handle both formats
      id: decoded.id || decoded._id,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email
    };
    
    next();
  });
};






// Admin role middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Optional authentication (doesn't fail if no token)
// const optionalAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (token) {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
//       const user = await User.findById(decoded.id).select('-password');
//       if (user) {
//         req.user = user;
//       }
//     }
//     next();
//   } catch (error) {
//     // Continue without authentication if token is invalid
//     next();
//   }
// };

module.exports = {
  authenticateToken,
  requireAdmin,
//   optionalAuth
};
