const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const removeTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');

    const emailsToRemove = [
      'testrender@example.com',
      'test3@test.com',
      'test@test.com'
    ];

    const result = await User.deleteMany({ email: { $in: emailsToRemove } });
    console.log(`Successfully deleted ${result.deletedCount} test users.`);

  } catch (error) {
    console.error('Error deleting users:', error);
  } finally {
    mongoose.disconnect();
  }
};

removeTestUsers();
