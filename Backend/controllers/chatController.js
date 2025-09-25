const Chat = require('../models/chat');
const Message = require('../models/message');
const User = require('../models/User');

// Get all chats for a user (Instagram-style chat list)
const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      participants: userId
    })
    .populate('participants', 'name email profilePic')
    .populate('lastMessage')
    .sort({ updatedAt: -1 })
    .limit(20);

    // ✅ FIXED: Keep participants in formatted chats
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(
        p => p._id.toString() !== userId.toString()
      );

      return {
        _id: chat._id,
        type: chat.isGroup ? 'group' : 'direct',
        name: chat.isGroup ? chat.groupName : otherParticipant?.name,
        profilePic: chat.isGroup ? chat.groupImage : otherParticipant?.profilePic,
        lastMessage: chat.lastMessage,
        lastActivity: chat.updatedAt,
        otherUser: otherParticipant,
        participants: chat.participants // ✅ ADDED: Keep participants array
      };
    });

    console.log(`📱 Fetched ${formattedChats.length} chats for user ${userId}`);
    res.json(formattedChats);
  } catch (error) {
    console.error('❌ Get chats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get specific chat by ID (with participants)
const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    })
    .populate('participants', 'name email profilePic')
    .populate('lastMessage');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    console.log('🔍 Specific chat fetched:', {
      id: chat._id,
      participants: chat.participants
    });

    res.json(chat);
  } catch (error) {
    console.error('❌ Get chat by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create or get existing chat
const createOrGetChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user._id;

    console.log(`🔗 Creating chat between ${userId} and ${participantId}`);

    // Check if chat already exists
    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [userId, participantId] }
    })
    .populate('participants', 'name email profilePic');

    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [userId, participantId],
        isGroup: false
      });
      await chat.save();
      await chat.populate('participants', 'name email profilePic');
      console.log(`✅ New chat created: ${chat._id}`);
    } else {
      console.log(`✅ Existing chat found: ${chat._id}`);
    }

    res.json(chat);
  } catch (error) {
    console.error('❌ Create chat error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get messages for a chat
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name email profilePic')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      { 
        chat: chatId,
        sender: { $ne: req.user._id }
      },
      { $addToSet: { readBy: { userId: req.user._id, readAt: new Date() } } }
    );

    console.log(`💬 Fetched ${messages.length} messages for chat ${chatId}`);
    res.json(messages.reverse());
  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = 'text' } = req.body;
    const senderId = req.user._id;

    console.log('📤 Received payload:', { content, messageType });
    console.log('📤 Chat ID:', chatId);
    console.log('📤 Sender ID:', senderId);

    // Check if user is participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: senderId
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Create message with correct field names
    const message = new Message({
      chat: chatId,
      sender: senderId,
      content,
      type: messageType
    });

    console.log('💾 Saving message with fields:', {
      chat: chatId,
      sender: senderId,
      content,
      type: messageType
    });

    await message.save();
    await message.populate('sender', 'name email profilePic');

    // Update chat's last message and activity
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    // Emit real-time message via WebSocket
    if (req.io) {
      chat.participants.forEach(participantId => {
        if (participantId.toString() !== senderId.toString()) {
          req.io.to(participantId.toString()).emit('newMessage', {
            chatId,
            message,
            sender: req.user
          });
        }
      });
      console.log(`🚀 Real-time message sent to chat ${chatId}`);
    }

    console.log(`✅ Message sent successfully in chat ${chatId}`);
    res.status(201).json(message);
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserChats,
  createOrGetChat,
  getChatMessages,
  sendMessage,
  getChatById
};
