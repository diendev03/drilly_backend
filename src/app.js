1// app.js
const express = require('express');
const app = express();
const initRoutes=require('./routes/index.js');
app.use(express.json());

initRoutes(app);

app.get('/api/abc', (req, res) => {
  res.json('You are so beautiful.');});

module.exports = app;
