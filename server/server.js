const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const connectDB = require('./config/db');
const configurePassport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

// 1. Load Environment Variables from .env file
dotenv.config();

// 2. Initialize Database Connection
connectDB();

// 3. Configure Passport OAuth Strategies
configurePassport();

const app = express();

// 4. CORS Configuration (Allows HTTP-Only cookies with credentials)
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  })
);

// 5. Cookie parsing middleware
app.use(cookieParser());

// 6. Passport middleware initialization
app.use(passport.initialize());

// 7. Parse JSON for authentication routes
app.use('/api/auth', express.json(), authRoutes);

// 8. Payment routes
// Stripe webhook needs special raw-body handling
app.use('/api/payments', (req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));

// 8. API Route Mounts
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Auth & Stripe Payment REST API is running smoothly.',
    timestamp: new Date(),
  });
});

app.use('/api/payments', paymentRoutes);

// 9. 404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.originalUrl}`,
  });
});

// 10. Global Error Handler Middleware
app.use(errorHandler);

// 11. Start Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 Backend URL: http://localhost:${PORT}`);
  console.log(`🔗 Frontend Allowed Origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});
