const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env');

  await mongoose.connect(uri);
  isConnected = true;
  console.log('✅ Connected to MongoDB Atlas');
}

module.exports = connectDB;
