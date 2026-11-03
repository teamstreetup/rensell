const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const usersCol = mongoose.connection.db.collection('users');

    // Update existing user 7@gmail.com to admin
    await usersCol.updateOne({ email: '7@gmail.com' }, { $set: { role: 'admin' } });

    // Seed admin@rensell.com
    const adminExists = await usersCol.findOne({ email: 'admin@rensell.com' });
    if (!adminExists) {
      const hashedAdmin = await bcrypt.hash('admin123', 10);
      await usersCol.insertOne({
        name: 'Admin User',
        email: 'admin@rensell.com',
        password: hashedAdmin,
        role: 'admin',
        isBlocked: false,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Created admin@rensell.com');
    }

    // Seed user@rensell.com
    const testUserExists = await usersCol.findOne({ email: 'user@rensell.com' });
    if (!testUserExists) {
      const hashedUser = await bcrypt.hash('user123', 10);
      await usersCol.insertOne({
        name: 'Test Customer',
        email: 'user@rensell.com',
        password: hashedUser,
        role: 'user',
        isBlocked: false,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Created user@rensell.com');
    }

    const allUsers = await usersCol.find({}, { projection: { name: 1, email: 1, role: 1 } }).toArray();
    console.log('\nAll registered users in database:');
    console.table(allUsers);

    await mongoose.connection.close();
    console.log('Done!');
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();

