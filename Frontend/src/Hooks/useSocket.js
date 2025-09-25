import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import { getFollowRequests } from '../Store/Slices/followSlice.js';

let socket = null;

const useSocket = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.user);
  const socketRef = useRef(null);

  useEffect(() => {
    if (userInfo?._id && !socket) {
      // Connect to WebSocket server
      const serverURL = process.env.NODE_ENV === 'production' 
        ? 'https://api-umpredux.onrender.com' 
        : 'http://localhost:5000';
        
      socket = io(serverURL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: false
      });
      
      socketRef.current = socket;
      
      // Join user's personal notification room
      socket.emit('joinUser', userInfo._id);
      
      // Connection events
      socket.on('connect', () => {
        console.log('✅ WebSocket connected:', socket.id);
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
      });

      // Follow request notifications
      socket.on('newFollowRequest', (data) => {
        console.log('🔔 New follow request received:', data);
        
        // FIXED: Use existing Redux action
        dispatch(getFollowRequests());
        
        // TODO: Add toast notification when you create the notification component
        console.log(`${data.from.name} sent you a follow request!`);
      });

      // Follow request accepted notification
      socket.on('followRequestAccepted', (data) => {
        console.log('✅ Follow request accepted:', data);
        
        // TODO: Add toast notification
        console.log(data.message);
      });

      // Follow request rejected notification
      socket.on('followRequestRejected', (data) => {
        console.log('❌ Follow request rejected:', data);
        
        // TODO: Add toast notification
        console.log(data.message);
      });
    }

    return () => {
      if (socket) {
        console.log('🔌 Cleaning up WebSocket connection');
        socket.disconnect();
        socket = null;
        socketRef.current = null;
      }
    };
  }, [userInfo?._id, dispatch]);

  // Return socket instance for use in components
  return socketRef.current;
};

export default useSocket;
