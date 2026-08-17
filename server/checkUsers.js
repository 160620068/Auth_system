const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auth_system_db';

const checkUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('\n==================================================');
    console.log('📊 MONGODB USERS INSPECTION SCRIPT');
    console.log('==================================================');
    
    // Fetch users collection directly from MongoDB
    const users = await mongoose.connection.db.collection('users').find({}).toArray();

    if (users.length === 0) {
      console.log('⚠️  No users found in database yet.');
      console.log('👉 Go to http://localhost:5173/register to create your first user!\n');
    } else {
      console.log(`✅ Total Users Found: ${users.length}\n`);
      users.forEach((u, index) => {
        console.log(`--- User #${index + 1} ---`);
        console.log(`ID:        ${u._id}`);
        console.log(`Username:  ${u.username}`);
        console.log(`Full Name: ${u.fullName}`);
        console.log(`Email:     ${u.email}`);
        console.log(`Provider:  ${u.provider}`);
        console.log(`Hashed PW: ${u.password ? u.password.substring(0, 25) + '...' : 'N/A (OAuth)'}`);
        console.log(`Created:   ${u.createdAt}\n`);
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inspecting MongoDB users:', error.message);
    process.exit(1);
  }
};

checkUsers();
