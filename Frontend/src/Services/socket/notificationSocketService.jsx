import { SOCKET_EVENTS } from './sockettConfig.jsx';
import toast from 'react-hot-toast';

class NotificationSocketService {
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

    // Handle post liked (future)
    this.eventHandlers.postLiked = (data) => {
      console.log('❤️ Post liked:', data);
      
      toast.success(`${data.user.name} liked your post`, {
        icon: '❤️',
        duration: 3000,
      });
    };

    // Handle post commented (future)
    this.eventHandlers.postCommented = (data) => {
      console.log('💬 Post commented:', data);
      
      toast.success(`${data.user.name} commented on your post`, {
        icon: '💬',
        duration: 4000,
      });
    };

    // Register future event handlers
    // this.socket.on(SOCKET_EVENTS.POST_LIKED, this.eventHandlers.postLiked);
    // this.socket.on(SOCKET_EVENTS.POST_COMMENTED, this.eventHandlers.postCommented);
  }

  cleanup() {
    if (!this.socket) return;

    // Remove event handlers when implemented
    this.eventHandlers = {};
    this.socket = null;
  }
}

export default NotificationSocketService;
