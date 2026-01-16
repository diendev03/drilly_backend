const express = require('express');
const router = express.Router();
const callController = require('../controllers/call.controller');
const verifyToken = require('../middlewares/verifyToken');

// POST /api/v1/call/token
router.post('/token', verifyToken, callController.generateToken);

module.exports = router;
