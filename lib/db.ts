import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

function getMongoUri(): string {
  const mongoUri = process.env.MONGODB_URI || '';

  if (!mongoUri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (/username:password|cluster\.mongodb\.net|your-cluster|your-password/i.test(mongoUri)) {
    throw new Error(
      'MONGODB_URI appears to be a placeholder. Replace it with your real MongoDB Atlas connection string from the Atlas dashboard.'
    );
  }

  return mongoUri;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(getMongoUri(), opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
