const User = require('../models/User');
const generateTokenAndSetCookie = require('../utils/generateToken');

/**
 * @desc    Register a new local user with email & password
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { username, fullName, email, password, confirmPassword } = req.body;

    // 1. Validate required fields
    if (!username || !fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (username, fullName, email, password, confirmPassword).',
      });
    }

    // 2. Validate matching passwords
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match. Please ensure both password fields are identical.',
      });
    }

    // 3. Password length check
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // 4. Check for existing email or username in MongoDB
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please login instead.',
      });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken. Please choose a different username.',
      });
    }

    // 5. Create new User document (Password is automatically hashed via Mongoose pre-save hook)
    const user = await User.create({
      username,
      fullName,
      email: email.toLowerCase(),
      password,
      provider: 'local',
    });

    // 6. Generate JWT and attach to HTTP-only cookie
    generateTokenAndSetCookie(res, user._id);

    // 7. Send successful response with sanitized user data
    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        provider: user.provider,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Registration Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during user registration.',
    });
  }
};

/**
 * @desc    Authenticate user with email & password
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // 2. Find user in database, explicitly selecting the password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // 3. Verify user existence and password match
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    // 4. Generate JWT & set HTTP-only cookie
    generateTokenAndSetCookie(res, user._id);

    // 5. Send authenticated user data
    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        provider: user.provider,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during user login.',
    });
  }
};

/**
 * @desc    Log out current user by clearing HTTP-Only JWT Cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = (req, res) => {
  try {
    // Clear the HTTP-only cookie by setting its expiration to immediate past
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during logout.',
    });
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile.',
    });
  }
};

/**
 * @desc    OAuth Callback Handler (Google / GitHub)
 *          Attaches JWT cookie and redirects user to React client home page
 * @route   GET /api/auth/google/callback OR /api/auth/github/callback
 * @access  Public
 */
const oauthCallback = (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
    }

    // Generate JWT cookie for OAuth authenticated user
    generateTokenAndSetCookie(res, req.user._id);

    // Redirect to React Frontend Home Page
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/home`);
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/login?error=oauth_server_error`);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  oauthCallback,
};
