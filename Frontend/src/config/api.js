// Centralized API configuration
const isDevelopment = import.meta.env.MODE === 'development';

// ✅ UPDATE THIS IP ADDRESS IF IT CHANGES
const LOCAL_IP = '192.168.1.7'; // Change this to your current IP
const LOCAL_PORT = '5000';

export const API_CONFIG = {
  BASE_URL: isDevelopment 
    ? `http://${LOCAL_IP}:${LOCAL_PORT}/api`
    : 'https://api-umpredux.onrender.com/api',
    
  SOCKET_URL: isDevelopment
    ? `http://${LOCAL_IP}:${LOCAL_PORT}`
    : 'https://api-umpredux.onrender.com',
    
  // Individual service URLs
  USERS: isDevelopment 
    ? `http://${LOCAL_IP}:${LOCAL_PORT}/api/users`
    : 'https://api-umpredux.onrender.com/api/users',
    
  POSTS: isDevelopment 
    ? `http://${LOCAL_IP}:${LOCAL_PORT}/api/posts`
    : 'https://api-umpredux.onrender.com/api/posts',
    
  STORIES: isDevelopment 
    ? `http://${LOCAL_IP}:${LOCAL_PORT}/api/stories`
    : 'https://api-umpredux.onrender.com/api/stories',
    
  CHAT: isDevelopment 
    ? `http://${LOCAL_IP}:${LOCAL_PORT}/api/chat`
    : 'https://api-umpredux.onrender.com/api/chat',
    
  FOLLOW: isDevelopment 
    ? `http://${LOCAL_IP}:${LOCAL_PORT}/api/follow`
    : 'https://api-umpredux.onrender.com/api/follow'
};

// Helper function to get current IP (for debugging)
export const getCurrentConfig = () => {
  console.log('🌐 Current API Config:', {
    mode: import.meta.env.MODE,
    baseUrl: API_CONFIG.BASE_URL,
    socketUrl: API_CONFIG.SOCKET_URL
  });
  return API_CONFIG;
};