const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const AdminUserSchema = new mongoose.Schema({}, { strict: false });

async function countUsers() {
  try {
    const mongoUri = process.env.ADMIN_MONGODB_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('No MongoDB URI found in environment variables');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    
    const AdminUser = mongoose.model('users', AdminUserSchema);
    const count = await AdminUser.countDocuments();
    
    console.log('\n========================================');
    console.log(`Total Users in Database: ${count}`);
    console.log('========================================\n');
    
    // Also show some sample users (just basic info)
    if (count > 0) {
      const users = await AdminUser.find({}, { email: 1, name: 1, username: 1, role: 1, createdAt: 1 }).limit(10);
      console.log('Sample users (max 10):');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'N/A'} (@${user.username || 'no-username'}) - ${user.email} - Role: ${user.role || 'user'}`);
      });
      console.log('');
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

countUsers();
