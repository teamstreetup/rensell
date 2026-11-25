require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');

async function testSetup() {
  try {
    console.log('Testing RENSELL Express Backend Configuration...');
    console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Missing');
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
    console.log('- RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Missing');

    await connectDB();
    const [productCount, userCount] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
    ]);
    console.log(`Products in DB: ${productCount}`);
    console.log(`Users in DB: ${userCount}`);
    await mongoose.connection.close();
    console.log('Configuration test passed!');
  } catch (error) {
    console.error('Configuration test failed:', error.message);
    process.exit(1);
  }
}

testSetup();
