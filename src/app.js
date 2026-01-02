const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const initRoutes = require('./routes/index.js');

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// API Routes
initRoutes(app);

// Serve Static Frontend (Drilly Web)
const buildPath = path.join(__dirname, '../../drilly_web/dist');
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
