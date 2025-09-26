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

    const formattedChats = await Promise.all(chats.map(async (chat) => {
      const otherParticipant = chat.participants.find(
        p => p._id.toString() !== userId.toString()
      );

      // Count unread messages for this chat
      const unreadCount = await Message.countDocuments({
        chat: chat._id,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      });

      return {
        _id: chat._id,
        type: chat.isGroup ? 'group' : 'direct',
        name: chat.isGroup ? chat.groupName : otherParticipant?.name,
        profilePic: chat.isGroup ? chat.groupImage : otherParticipant?.profilePic,
        lastMessage: chat.lastMessage,
        lastActivity: chat.updatedAt,
        otherUser: otherParticipant,
        participants: chat.participants,
        unreadCount: unreadCount
      };
    }));

    res.json(formattedChats);
  } catch (error) {
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

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create or get existing chat
const   createOrGetChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user._id;

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
    }

    res.json(chat);
  } catch (error) {
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
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id }
      },
      { $addToSet: { readBy: { user: req.user._id, readAt: new Date() } } }
    );

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get total unread message count for user (Instagram-style)
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all chats where user is participant
    const userChats = await Chat.find({
      participants: userId
    }).select('_id');

    const chatIds = userChats.map(chat => chat._id);

    // Count unread messages across all chats
    const totalUnreadCount = await Message.countDocuments({
      chat: { $in: chatIds },
      sender: { $ne: userId },
      'readBy.user': { $ne: userId }
    });

    res.json({ unreadCount: totalUnreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = 'text' } = req.body;
    const senderId = req.user._id;

    // Validate message content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Check if user is participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: senderId
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Create message
    const message = new Message({
      chat: chatId,
      sender: senderId,
      content: content.trim(),
      type: messageType
    });

    await message.save();
    await message.populate('sender', 'name email profilePic');

    // Update chat's last message and activity
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    // Broadcast message to chat room - ENHANCED for better delivery
    if (req.io) {
      console.log(`📤 Broadcasting message to chat ${chatId} from user ${senderId}`);
      
      // Emit to the chat room
      req.io.to(chatId).emit('newMessage', {
        chatId,
        message: {
          ...message.toObject(),
          sender: {
            _id: senderId,
            name: req.user.name,
            email: req.user.email,
            profilePic: req.user.profilePic
          }
        }
      });
      
      // Also emit to all participants individually (backup delivery)
      chat.participants.forEach(participantId => {
        if (participantId.toString() !== senderId.toString()) {
          req.io.to(`user_${participantId}`).emit('newMessage', {
            chatId,
            message: {
              ...message.toObject(),
              sender: {
                _id: senderId,
                name: req.user.name,
                email: req.user.email,
                profilePic: req.user.profilePic
              }
            }
          });
        }
      });
      
      console.log(`✅ Message broadcasted successfully`);
    } else {
      console.log('⚠️ Socket.io not available for broadcasting');
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserChats,
  createOrGetChat,
  getChatMessages,
  sendMessage,
  getChatById,
  getUnreadCount
};
