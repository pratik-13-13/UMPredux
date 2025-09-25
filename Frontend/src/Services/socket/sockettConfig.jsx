// WebSocket configuration
export const SOCKET_CONFIG = {
  development: {
    url: 'http://localhost:5000',
    options: {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    }
  },
  production: {
    url: 'https://api-umpredux.onrender.com',
    options: {
      transports: ['websocket', 'polling'],
      timeout: 15000,
      forceNew: false,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 3,
    }
  }
};

export const getSocketConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return SOCKET_CONFIG[env];
};

// Socket event constants
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // User events
  JOIN_USER: 'joinUser',
  
  // Follow events
  NEW_FOLLOW_REQUEST: 'newFollowRequest',
  FOLLOW_REQUEST_ACCEPTED: 'followRequestAccepted',
  FOLLOW_REQUEST_REJECTED: 'followRequestRejected',
  
  // Chat events (NEW)
  JOIN_CHAT: 'joinChat',
  LEAVE_CHAT: 'leaveChat',
  NEW_MESSAGE: 'newMessage',
  TYPING: 'typing',
  STOP_TYPING: 'stopTyping',
  USER_TYPING: 'userTyping',
  USER_STOPPED_TYPING: 'userStoppedTyping',
  MESSAGE_READ: 'messageRead',
  
  // Post events (future)
  POST_LIKED: 'postLiked',
  POST_COMMENTED: 'postCommented',
};
