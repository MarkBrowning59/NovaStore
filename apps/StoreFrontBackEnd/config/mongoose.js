// config/mongoose.js
const mongoose = require('mongoose');

async function connectMongoose() {
  if (mongoose.connection.readyState === 1) {
    // already connected
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  await mongoose.connect(process.env.MONGO_URI, {
    // You can tune options later if needed
  });

  return mongoose.connection;
}

module.exports = connectMongoose;
