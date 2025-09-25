

const jwt = require('jsonwebtoken');
const {User} = require('../models/User');

const authenticateToken = async (req, res, next) => {
  

  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // ✅ FIX: Use 'id' instead of 'userId' (match your JWT payload)
    const userId = decoded.id || decoded.userId; // Support both formats
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
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
