const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');

    // Admin credentials
    const adminEmail = 'admin@educonnectsl.org';
    const adminPassword = 'AdminPassword2026!'; // Default secure password

    // Check if admin already exists
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      // If user exists but is not admin, promote them
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('Existing user promoted to admin.');
      } else {
        console.log('Admin user already exists.');
      }
    } else {
      // Create new admin user
      adminUser = await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        privacyConsent: true
      });
      console.log('New admin user created successfully.');
    }

    console.log('\n--- ADMIN CREDENTIALS ---');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('-------------------------\n');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();
