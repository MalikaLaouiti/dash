import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env');
}

// ✅ Add detailed logging
console.log('🔗 MongoDB URI (masked):', MONGODB_URI?.replace(/:[^:]*@/, ':****@'));

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    console.log('✅ Using cached connection');
    console.log('   Database:', cached.conn.connection.name);
    console.log('   State:', cached.conn.connection.readyState);
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('🔄 Creating new MongoDB connection...');
    
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      console.log('   Database:', mongoose.connection.name);
      console.log('   Host:', mongoose.connection.host);
      console.log('   Port:', mongoose.connection.port);
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}