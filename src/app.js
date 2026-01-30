const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const initRoutes = require('./routes/index.js');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// CORS configuration for web client
const allowedOrigins = [
  'https://drilly.io.vn',
  'https://www.drilly.io.vn',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow all localhost origins for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
initRoutes(app);

// Serve Static Frontend (Drilly Web)
const buildPath = path.join(__dirname, '../../drilly_flutter/build/web');
app.use(express.static(buildPath));

// Fallback for React Router
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Test endpoint
app.get('/api/abc', (req, res) => {
  res.json('You are so beautiful.');
});

module.exports = app;
