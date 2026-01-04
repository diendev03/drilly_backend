const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const verifyToken = require('../middlewares/verifyToken');


// Create conversation
router.get('/', verifyToken, conversationController.getConversations);
router.post('/create', verifyToken, conversationController.createConversation);

// Đánh dấu đã đọc
router.post("/:id/read", verifyToken, conversationController.markAsRead);

module.exports = router;