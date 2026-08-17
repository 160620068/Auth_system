const express = require('express');
const passport = require('passport');
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  oauthCallback,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Local Email/Password Authentication Routes ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);

// --- Google OAuth 2.0 Authentication Routes ---
router.get('/google', (req, res, next) => {
  if (!passport._key || !passport._strategies.google) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/login?error=google_not_configured`);
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!passport._strategies.google) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      return res.redirect(`${clientUrl}/login?error=google_not_configured`);
    }
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_oauth_failed` })(req, res, next);
  },
  oauthCallback
);

// --- GitHub OAuth 2.0 Authentication Routes ---
router.get('/github', (req, res, next) => {
  if (!passport._strategies.github) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/login?error=github_not_configured`);
  }
  passport.authenticate('github', { scope: ['user:email'], session: false })(req, res, next);
});

router.get(
  '/github/callback',
  (req, res, next) => {
    if (!passport._strategies.github) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      return res.redirect(`${clientUrl}/login?error=github_not_configured`);
    }
    passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=github_oauth_failed` })(req, res, next);
  },
  oauthCallback
);

module.exports = router;
