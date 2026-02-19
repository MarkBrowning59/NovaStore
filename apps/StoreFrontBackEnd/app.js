// app.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const apiRoutes = require('./routes/api');
const novaMongoDBRepository = require('./Repositories/NovaMongoDBRepository');

if (!process.env.ALLOWED_ORIGIN) {
  throw new Error('Missing ALLOWED_ORIGIN env variable');
}
if (!process.env.MONGO_URI) {
  throw new Error('Missing MONGO_URI env variable');
}

const app = express();


// CORS middleware — do this ONCE and EARLY
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser / server-to-server requests with no origin
      if (!origin) return callback(null, true);

      if (process.env.ALLOWED_ORIGIN.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true, // if you need cookies/auth
  })
);


// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // fine for dev
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);


app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,            // plenty for dev
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled error:', err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong.',
  });
});

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // 1) Connect Mongoose (for Product model / productMongoRepository)
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Mongoose connection established');

    // 2) Initialize native Mongo repository (your existing NovaMongoDBRepository)
    await novaMongoDBRepository.init_NovaMongoDBRepository();
    console.log('Nova MongoDB Repository Initialized');

    // 3) Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize application:', err);
    process.exit(1);
  }
})();

module.exports = app;
