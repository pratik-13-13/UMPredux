import { SOCKET_EVENTS } from './sockettConfig.jsx';
import  store  from '../../Store/Store.js';
import { addMessage, setTyping } from '../../Store/Slices/chatSlice.js';
import toast from 'react-hot-toast';

class ChatSocketService {
  constructor() {
    this.socket = null;
    this.eventHandlers = {};
  }

  initialize(socket) {
    this.socket = socket;
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    if (!this.socket) return;

    // Handle new message
    this.eventHandlers.newMessage = (data) => {
      console.log('💬 New message received:', data);
      
      // Update Redux store
      store.dispatch(addMessage({ 
        chatId: data.chatId, 
        message: data.message 
      }));
      
      // Show notification if not in current chat
      const currentPath = window.location.pathname;
      if (!currentPath.includes(`/chat/${data.chatId}`)) {
        toast.success(`New message from ${data.sender.name}`, {
          icon: '💬',
          duration: 4000,
        });
      }
    };

    // Handle typing indicator
    this.eventHandlers.userTyping = (data) => {
      console.log('⌨️ User typing:', data);
      
      // Get current chat ID from URL
      const currentPath = window.location.pathname;
      const chatIdMatch = currentPath.match(/\/chat\/(.+)/);
      
      if (chatIdMatch) {
        const chatId = chatIdMatch[1];
        store.dispatch(setTyping({ 
          chatId, 
          user: data.user, 
          isTyping: true 
        }));
      }
    };

    this.eventHandlers.userStoppedTyping = (data) => {
      console.log('⌨️ User stopped typing:', data);
      
      // Get current chat ID from URL
      const currentPath = window.location.pathname;
      const chatIdMatch = currentPath.match(/\/chat\/(.+)/);
      
      if (chatIdMatch) {
        const chatId = chatIdMatch[1];
        store.dispatch(setTyping({ 
          chatId, 
          user: data.user, 
          isTyping: false 
        }));
      }
    };

    // Handle message read
    this.eventHandlers.messageRead = (data) => {
      console.log('✅ Message read:', data);
      // Handle message read status update
    };

    // Register event handlers
    this.socket.on(SOCKET_EVENTS.NEW_MESSAGE, this.eventHandlers.newMessage);
    this.socket.on(SOCKET_EVENTS.USER_TYPING, this.eventHandlers.userTyping);
    this.socket.on(SOCKET_EVENTS.USER_STOPPED_TYPING, this.eventHandlers.userStoppedTyping);
    this.socket.on(SOCKET_EVENTS.MESSAGE_READ, this.eventHandlers.messageRead);
  }

  // Join a chat room
  joinChat(chatId, userId) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.JOIN_CHAT, { chatId, userId });
    }
  }

  // Leave a chat room
  leaveChat(chatId, userId) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.LEAVE_CHAT, { chatId, userId });
    }
  }

  // Send typing indicator
  sendTyping(chatId, user) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.TYPING, { chatId, user });
    }
  }

  // Send stop typing indicator
  sendStopTyping(chatId, user) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.STOP_TYPING, { chatId, user });
    }
  }

  cleanup() {
    if (!this.socket) return;

    // Remove event handlers
    this.socket.off(SOCKET_EVENTS.NEW_MESSAGE, this.eventHandlers.newMessage);
    this.socket.off(SOCKET_EVENTS.USER_TYPING, this.eventHandlers.userTyping);
    this.socket.off(SOCKET_EVENTS.USER_STOPPED_TYPING, this.eventHandlers.userStoppedTyping);
    this.socket.off(SOCKET_EVENTS.MESSAGE_READ, this.eventHandlers.messageRead);

    this.eventHandlers = {};
    this.socket = null;
  }
}

export default ChatSocketService;
