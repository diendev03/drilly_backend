const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const verifyToken = require('../middlewares/verifyToken');


// Create conversation
router.get('/', verifyToken, conversationController.getConversations);
router.post('/create', verifyToken, conversationController.createConversation);

module.exports = router;