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
        : 'http://192.168.1.154:5000'; // ✅ FIXED: Use your local server URL
        
      socket = io(serverURL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: false
      });
      
      socketRef.current = socket;
      
      // ✅ ADDED: Make socket globally accessible for chat
      window.globalSocket = socket;
      
      // Join user's personal notification room
      socket.emit('joinUser', userInfo._id);
      
      // Connection events
      socket.on('connect', () => {
      });

      socket.on('disconnect', (reason) => {
      });

      // Follow request notifications
      socket.on('newFollowRequest', (data) => {
        dispatch(getFollowRequests());
      });

      // Follow request accepted notification
      socket.on('followRequestAccepted', (data) => {
       
      });

      // Follow request rejected notification
      socket.on('followRequestRejected', (data) => {
     
      });

      // ✅ ADDED: Chat message handling (will be used by ChatWindow)
      socket.on('newMessage', (data) => {
        
      });
    }

    return () => {
      if (socket) {
      
        window.globalSocket = null; // ✅ ADDED: Clean up global reference
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
