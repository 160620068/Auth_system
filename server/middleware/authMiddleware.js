const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware:
 * Protects endpoints by inspecting and verifying the HTTP-Only JWT Cookie.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Read token from HTTP-only cookie 'jwt'
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // 2. Reject if no token is present
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, please log in to access this resource.',
    });
  }

  try {
    // 3. Verify JWT token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    // 4. Fetch user from MongoDB, excluding sensitive password field
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user account no longer exists.',
      });
    }

    // 5. Proceed to next middleware or controller
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid or expired token.',
    });
  }
};

module.exports = { protect };
