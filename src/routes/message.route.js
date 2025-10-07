const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const verifyToken = require('../middlewares/verifyToken');


// Create conversation
router.post('/send', verifyToken, messageController.sendMessage);
router.get('/:conversationId', verifyToken, messageController.getMessages);

module.exports = router;