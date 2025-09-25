import { SOCKET_EVENTS } from './sockettConfig.jsx';
import  store  from '../../Store/Store.js';
import { getFollowRequests } from '../../Store/Slices/followSlice.js';
import toast from 'react-hot-toast';

class FollowSocketService {
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

    // Handle new follow request
    this.eventHandlers.newFollowRequest = (data) => {
      console.log('🔔 New follow request received:', data);
      
      // Update Redux store
      store.dispatch(getFollowRequests());
      
      // Show notification
      toast.success(`${data.from.name} sent you a follow request!`, {
        icon: '👤',
        duration: 5000,
      });
    };

    // Handle follow request accepted
    this.eventHandlers.followRequestAccepted = (data) => {
      console.log('✅ Follow request accepted:', data);
      
      toast.success(data.message, {
        icon: '🎉',
        duration: 5000,
      });
    };

    // Handle follow request rejected
    this.eventHandlers.followRequestRejected = (data) => {
      console.log('❌ Follow request rejected:', data);
      
      toast.error(data.message, {
        icon: '😔',
        duration: 4000,
      });
    };

    // Register event handlers
    this.socket.on(SOCKET_EVENTS.NEW_FOLLOW_REQUEST, this.eventHandlers.newFollowRequest);
    this.socket.on(SOCKET_EVENTS.FOLLOW_REQUEST_ACCEPTED, this.eventHandlers.followRequestAccepted);
    this.socket.on(SOCKET_EVENTS.FOLLOW_REQUEST_REJECTED, this.eventHandlers.followRequestRejected);
  }

  cleanup() {
    if (!this.socket) return;

    // Remove event handlers
    this.socket.off(SOCKET_EVENTS.NEW_FOLLOW_REQUEST, this.eventHandlers.newFollowRequest);
    this.socket.off(SOCKET_EVENTS.FOLLOW_REQUEST_ACCEPTED, this.eventHandlers.followRequestAccepted);
    this.socket.off(SOCKET_EVENTS.FOLLOW_REQUEST_REJECTED, this.eventHandlers.followRequestRejected);

    this.eventHandlers = {};
    this.socket = null;
  }
}

export default FollowSocketService;
