const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

/**
 * Configure Passport OAuth Strategies for Google and GitHub
 */
const configurePassport = () => {
  // --- Google OAuth Strategy ---
  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here'
  ) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

            // 1. Check if user exists by googleId
            let user = await User.findOne({ googleId: profile.id });

            if (!user && email) {
              // 2. Check if user exists by email
              user = await User.findOne({ email });
              if (user) {
                user.googleId = profile.id;
                if (!user.avatar) user.avatar = avatar;
                await user.save();
              }
            }

            // 3. Create new user if not found
            if (!user) {
              const baseUsername = profile.displayName
                ? profile.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')
                : `user_${profile.id.substring(0, 6)}`;

              user = await User.create({
                username: `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`,
                fullName: profile.displayName || 'Google User',
                email: email || `${profile.id}@google.oauth`,
                provider: 'google',
                googleId: profile.id,
                avatar: avatar,
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  } else {
    console.log('ℹ️ Google OAuth credentials not configured in .env (Skipping Strategy)');
  }

  // --- GitHub OAuth Strategy ---
  if (
    process.env.GITHUB_CLIENT_ID &&
    process.env.GITHUB_CLIENT_ID !== 'your_github_client_id_here'
  ) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/callback`,
          scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email =
              profile.emails && profile.emails[0]
                ? profile.emails[0].value
                : `${profile.username}@github.oauth`;

            const avatar =
              profile.photos && profile.photos[0]
                ? profile.photos[0].value
                : profile._json.avatar_url || '';

            // 1. Check if user exists by githubId
            let user = await User.findOne({ githubId: profile.id });

            if (!user && email) {
              // 2. Check if user exists by email
              user = await User.findOne({ email });
              if (user) {
                user.githubId = profile.id;
                if (!user.avatar) user.avatar = avatar;
                await user.save();
              }
            }

            // 3. Create new user if not found
            if (!user) {
              user = await User.create({
                username: `${profile.username || 'github_user'}_${Math.floor(1000 + Math.random() * 9000)}`,
                fullName: profile.displayName || profile.username || 'GitHub User',
                email: email,
                provider: 'github',
                githubId: profile.id,
                avatar: avatar,
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  } else {
    console.log('ℹ️ GitHub OAuth credentials not configured in .env (Skipping Strategy)');
  }
};

module.exports = configurePassport;