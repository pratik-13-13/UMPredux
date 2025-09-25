import io from 'socket.io-client';
import { getSocketConfig, SOCKET_EVENTS } from './sockettConfig.jsx';
import FollowSocketService from './followSocketService.jsx';
import ChatSocketService from './chatSocketService.jsx'; 
import NotificationSocketService from './notificationSocketService.jsx';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentUserId = null;
    
    // Initialize service handlers
    this.followService = new FollowSocketService();
    this.chatService = new ChatSocketService(); // NEW
    this.notificationService = new NotificationSocketService();
  }

  // Initialize socket connection
  initialize(userId) {
    if (!userId || this.currentUserId === userId) return;
    
    const config = getSocketConfig();
    
    // Disconnect existing connection if any
    this.disconnect();
    
    // Create new connection
    this.socket = io(config.url, config.options);
    this.currentUserId = userId;
    
    this.setupConnectionEvents();
    this.setupServiceHandlers();
    
    return this.socket;
  }

  // Setup connection events
  setupConnectionEvents() {
    if (!this.socket) return;

    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
      
      // Join user's notification room
      this.socket.emit(SOCKET_EVENTS.JOIN_USER, this.currentUserId);
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      // Re-join user room on reconnection
      if (this.currentUserId) {
        this.socket.emit(SOCKET_EVENTS.JOIN_USER, this.currentUserId);
      }
    });
  }

  // Setup service handlers
  setupServiceHandlers() {
    if (!this.socket) return;

    // Initialize follow service
    this.followService.initialize(this.socket);
    
    // Initialize chat service (NEW)
    this.chatService.initialize(this.socket);
    
    // Initialize notification service
    this.notificationService.initialize(this.socket);
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check connection status
  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      
      // Cleanup service handlers
      this.followService.cleanup();
      this.chatService.cleanup(); // NEW
      this.notificationService.cleanup();
      
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUserId = null;
    }
  }

  // Emit event
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;
