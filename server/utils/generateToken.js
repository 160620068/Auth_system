const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT and sets it as a secure HTTP-Only Cookie on the response object.
 * 
 * @param {Object} res - Express response object
 * @param {string} userId - User's MongoDB ObjectId string
 * @returns {string} token - The signed JWT token
 */
const generateTokenAndSetCookie = (res, userId) => {
  // 1. Sign JWT with user ID payload and 7-day expiration
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '7d',
  });

  // 2. Cookie configuration parameters
  const cookieOptions = {
    httpOnly: true, // Prevents client-side JavaScript from reading cookie (XSS protection)
    secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
    sameSite: 'lax', // Protects against Cross-Site Request Forgery (CSRF)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };

  // 3. Set the cookie on response
  res.cookie('jwt', token, cookieOptions);

  return token;
};

module.exports = generateTokenAndSetCookie;
