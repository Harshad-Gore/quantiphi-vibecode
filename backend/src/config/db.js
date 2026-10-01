const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) {
    console.warn('[db] No MONGODB_URI set — running in stateless (in-memory + mock) mode.');
    return null;
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('[db] MongoDB connected');
  return mongoose.connection;
}

module.exports = { connectDB };
