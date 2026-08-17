const mongoose = require('mongoose');

/**
 * Connects to MongoDB database using Mongoose.
 * Logs successful connection or handles connection errors gracefully.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auth_system_db');
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('💡 Tip: Ensure MongoDB is running locally (mongod) or provide a valid MONGO_URI in .env');
    // Exit process with failure code
    process.exit(1);
  }
};

module.exports = connectDB;
