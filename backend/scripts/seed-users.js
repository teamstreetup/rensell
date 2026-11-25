require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

async function seedUsers() {
  try {
    await connectDB();

    const adminExists = await User.findOne({ email: 'admin@rensell.com' });
    if (!adminExists) {
      const hashedAdmin = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@rensell.com',
        password: hashedAdmin,
        role: 'admin',
        isBlocked: false,
        isVerified: true,
      });
      console.log('Created admin@rensell.com (password: admin123)');
    }

    const userExists = await User.findOne({ email: 'user@rensell.com' });
    if (!userExists) {
      const hashedUser = await bcrypt.hash('user123', 10);
      await User.create({
        name: 'Test Customer',
        email: 'user@rensell.com',
        password: hashedUser,
        role: 'user',
        isBlocked: false,
        isVerified: true,
      });
      console.log('Created user@rensell.com (password: user123)');
    }

    const users = await User.find({}, 'name email role isVerified isBlocked').lean();
    console.table(users);
    await mongoose.connection.close();
  } catch (error) {
    console.error('Seed users error:', error);
    process.exit(1);
  }
}

seedUsers();
