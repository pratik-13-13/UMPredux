const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.js');
const {
  getUserChats,
  createOrGetChat,
  getChatMessages,
  sendMessage,
  getChatById
} = require('../controllers/chatController.js');

// Get all chats for user
router.get('/', authenticateToken, getUserChats);

// Create or get existing chat
router.post('/create', authenticateToken, createOrGetChat);

// Get specific chat by ID (with participants) - ✅ ADDED
router.get('/:chatId', authenticateToken, getChatById);

// Get messages for a specific chat
router.get('/:chatId/messages', authenticateToken, getChatMessages);

// Send message
router.post('/:chatId/messages', authenticateToken, sendMessage);

module.exports = router;
