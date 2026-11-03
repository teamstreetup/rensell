require('dotenv').config({ path: '.env.local' });

console.log('='.repeat(50));
console.log('RENSELL - Configuration Test');
console.log('='.repeat(50));
console.log('');

console.log('Environment Variables:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('- RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✓ Set' : '✗ Missing');
console.log('- NEXT_PUBLIC_RAZORPAY_KEY_ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? '✓ Set' : '✗ Missing');
console.log('- UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? '✓ Set (distributed limiter enabled)' : '○ Not set (in-memory limiter fallback)');
console.log('- UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? '✓ Set' : '○ Not set');
console.log('');

const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connected successfully');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('✓ Available collections:', collections.map(c => c.name).join(', '));

    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const count = await Product.countDocuments();
    console.log(`✓ Products in database: ${count}`);

    if (count > 0) {
      const products = await Product.find().limit(3);
      console.log('✓ Sample products:');
      products.forEach(p => console.log(`  - ${p.name} (₹${p.price})`));
    }

    await mongoose.connection.close();
    console.log('✓ Connection closed');
    console.log('');
    console.log('='.repeat(50));
    console.log('All tests passed! ✓');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

testConnection();
