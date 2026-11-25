const mongoose = require('mongoose');

function getMongoUri() {
  const mongoUri = (process.env.MONGODB_URI || '').trim();

  if (!mongoUri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (/username:password|cluster\.mongodb\.net|your-cluster|your-password/i.test(mongoUri)) {
    throw new Error(
      'MONGODB_URI appears to be a placeholder. Replace it with your real MongoDB connection string.'
    );
  }

  return mongoUri;
}

async function connectDB() {
  const rawUri = getMongoUri();
  const hasDbInUri = /mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/i.test(rawUri);

  const opts = {
    bufferCommands: false,
    ...(hasDbInUri ? {} : { dbName: 'rensell' }),
  };

  const conn = await mongoose.connect(rawUri, opts);
  console.log(`MongoDB connected: ${conn.connection.host} (db: ${conn.connection.name})`);
  return conn;
}

module.exports = connectDB;
