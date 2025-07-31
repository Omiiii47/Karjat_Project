import mongoose from 'mongoose';

let cached = (global as any).adminMongoose;

if (!cached) {
  cached = (global as any).adminMongoose = { conn: null, promise: null };
}

async function connectAdminDB() {
  if (cached.conn) {
    console.log('Using existing admin DB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Creating new admin DB connection');
    const opts = {
      bufferCommands: false,
    };

    const adminMongoUri = process.env.ADMIN_MONGODB_URI;
    if (!adminMongoUri) {
      console.error('ADMIN_MONGODB_URI not found in environment variables');
      throw new Error('Please define the ADMIN_MONGODB_URI environment variable inside .env.local');
    }

    console.log('Admin MongoDB URI found, connecting...');
    cached.promise = mongoose.createConnection(adminMongoUri, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('Admin DB connection established successfully');
  } catch (e) {
    cached.promise = null;
    console.error('Admin DB connection failed:', e);
    throw e;
  }

  return cached.conn;
}

export default connectAdminDB;
