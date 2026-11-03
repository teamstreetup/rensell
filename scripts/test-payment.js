require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(60));
console.log('PAYMENT CONFIGURATION TEST');
console.log('='.repeat(60));
console.log('');

// Check environment variables
console.log('1. Environment Variables:');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ MISSING');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ MISSING');
console.log('   RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✓ Set' : '✗ MISSING');
console.log('   RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✓ Set' : '✗ MISSING');
console.log('   NEXT_PUBLIC_RAZORPAY_KEY_ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? '✓ Set' : '✗ MISSING');
console.log('');

// Check Razorpay keys format
if (process.env.RAZORPAY_KEY_ID) {
  if (process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_')) {
    console.log('   ✓ Razorpay Key ID format correct (test mode)');
  } else if (process.env.RAZORPAY_KEY_ID.startsWith('rzp_live_')) {
    console.log('   ⚠ Razorpay Key ID is LIVE mode (use test for development)');
  } else if (process.env.RAZORPAY_KEY_ID.includes('your_key')) {
    console.log('   ✗ Razorpay Key ID is placeholder - UPDATE WITH REAL KEY!');
  } else {
    console.log('   ⚠ Razorpay Key ID format unknown');
  }
}
console.log('');

// Check if keys match
if (process.env.RAZORPAY_KEY_ID && process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
  if (process.env.RAZORPAY_KEY_ID === process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
    console.log('   ✓ RAZORPAY_KEY_ID and NEXT_PUBLIC_RAZORPAY_KEY_ID match');
  } else {
    console.log('   ✗ RAZORPAY_KEY_ID and NEXT_PUBLIC_RAZORPAY_KEY_ID DO NOT MATCH!');
    console.log('   They must be the same value!');
  }
}
console.log('');

// Payment methods available
console.log('2. Payment Methods Available:');
console.log('   ✓ Cash on Delivery (COD) - Always available');

if (process.env.RAZORPAY_KEY_ID && 
    process.env.RAZORPAY_KEY_SECRET && 
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
    !process.env.RAZORPAY_KEY_ID.includes('your_key')) {
  console.log('   ✓ Razorpay Online Payment - Configured');
  console.log('     - UPI (Google Pay, PhonePe, Paytm)');
  console.log('     - Credit/Debit Cards');
  console.log('     - Netbanking');
  console.log('     - Wallets');
} else {
  console.log('   ✗ Razorpay Online Payment - NOT configured');
  console.log('     To enable: Get keys from https://dashboard.razorpay.com');
}
console.log('');

// Test MongoDB connection
console.log('3. Testing MongoDB Connection...');
const mongoose = require('mongoose');

async function testPaymentSetup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('   ✓ MongoDB connected');
    
    // Check if Order model exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasOrders = collections.some(c => c.name === 'orders');
    
    if (hasOrders) {
      const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
      const orderCount = await Order.countDocuments();
      console.log(`   ✓ Orders collection exists (${orderCount} orders)`);
    } else {
      console.log('   ⚠ Orders collection not yet created (will be created on first order)');
    }
    
    // Check if User model exists
    const hasUsers = collections.some(c => c.name === 'users');
    if (hasUsers) {
      const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
      const userCount = await User.countDocuments();
      console.log(`   ✓ Users collection exists (${userCount} users)`);
      
      if (userCount === 0) {
        console.log('   ⚠ No users yet - Create account to test payment');
      }
    } else {
      console.log('   ⚠ Users collection not yet created');
      console.log('   → Create account at http://localhost:3000/auth/signup');
    }
    
    await mongoose.connection.close();
    console.log('');
    
    // Summary
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    
    const allEnvSet = process.env.MONGODB_URI && 
                      process.env.JWT_SECRET && 
                      process.env.RAZORPAY_KEY_ID && 
                      process.env.RAZORPAY_KEY_SECRET && 
                      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    
    const razorpayConfigured = process.env.RAZORPAY_KEY_ID && 
                               !process.env.RAZORPAY_KEY_ID.includes('your_key');
    
    if (allEnvSet && razorpayConfigured) {
      console.log('✅ ALL PAYMENT METHODS READY!');
      console.log('');
      console.log('You can test:');
      console.log('1. Cash on Delivery (COD)');
      console.log('2. Razorpay Online Payment');
      console.log('');
      console.log('Test card: 4111 1111 1111 1111');
      console.log('CVV: 123, Expiry: 12/25');
    } else if (process.env.MONGODB_URI && process.env.JWT_SECRET) {
      console.log('⚠️  PARTIAL SETUP - COD ONLY');
      console.log('');
      console.log('✓ Cash on Delivery works');
      console.log('✗ Razorpay not configured');
      console.log('');
      console.log('To enable Razorpay:');
      console.log('1. Go to https://dashboard.razorpay.com');
      console.log('2. Get Test API Keys');
      console.log('3. Update .env.local');
      console.log('4. Restart server');
    } else {
      console.log('❌ SETUP INCOMPLETE');
      console.log('');
      console.log('Missing configuration. Check .env.local file.');
    }
    
    console.log('');
    console.log('Next steps:');
    console.log('1. Start server: npm run dev');
    console.log('2. Create account: http://localhost:3000/auth/signup');
    console.log('3. Add products to cart');
    console.log('4. Test checkout');
    console.log('');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('   ✗ MongoDB connection failed:', error.message);
    console.log('');
    console.log('Fix: Update MONGODB_URI in .env.local');
    console.log('Get free MongoDB at: https://cloud.mongodb.com');
    process.exit(1);
  }
}

testPaymentSetup();
