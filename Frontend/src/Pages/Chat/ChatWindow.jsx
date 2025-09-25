import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getChatMessages, sendMessage, setCurrentChat, addMessage, setTyping } from '../../Store/Slices/chatSlice.js';
import socketService from '../../Services/socket/index.jsx';
import ChatHeader from '../../components/Chat/ChatHeader.jsx';
import MessageBubble from '../../components/Chat/MessageBubble.jsx';
import MessageInput from '../../components/Chat/MessageInput.jsx';
import TypingIndicator from '../../components/Chat/TypingIndicator.jsx';

const ChatWindow = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const { currentChat, messages, typingUsers, chats } = useSelector(state => state.chat); // Added chats
  const { userInfo } = useSelector(state => state.user);
  
  const chatMessages = messages[chatId] || [];
  const typingUsersInChat = typingUsers[chatId] || [];

  // ✅ FIXED: Get chat info from chats list if currentChat is not available
  const chatInfo = currentChat || chats.find(chat => chat._id === chatId);

  useEffect(() => {
    if (chatId) {
      // ✅ FIXED: Set current chat from chats list
      const foundChat = chats.find(chat => chat._id === chatId);
      if (foundChat && !currentChat) {
        dispatch(setCurrentChat(foundChat));
      }

      dispatch(getChatMessages({ chatId }));
      
      // Join chat room for real-time updates
      const socket = socketService.getSocket();
      if (socket) {
        socket.emit('joinChat', { chatId, userId: userInfo._id });
        
        // Listen for new messages
        socket.on('newMessage', (data) => {
          if (data.chatId === chatId) {
            dispatch(addMessage({ chatId, message: data.message }));
          }
        });
        
        // Listen for typing indicators
        socket.on('userTyping', (data) => {
          dispatch(setTyping({ chatId, user: data.user, isTyping: true }));
        });
        
        socket.on('userStoppedTyping', (data) => {
          dispatch(setTyping({ chatId, user: data.user, isTyping: false }));
        });
        
        return () => {
          socket.off('newMessage');
          socket.off('userTyping');
          socket.off('userStoppedTyping');
          socket.emit('leaveChat', { chatId, userId: userInfo._id });
        };
      }
    }
  }, [chatId, dispatch, userInfo._id, chats, currentChat]); // Added dependencies

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content) => {
    if (content.trim()) {
      dispatch(sendMessage({ chatId, content }));
    }
  };

  const handleTyping = (isTyping) => {
    const socket = socketService.getSocket();
    if (socket) {
      if (isTyping) {
        socket.emit('typing', { chatId, user: userInfo });
      } else {
        socket.emit('stopTyping', { chatId, user: userInfo });
      }
    }
  };

  if (!chatId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Chat Header */}
      <ChatHeader 
        chat={chatInfo}
        currentUser={userInfo} 
        onBack={() => navigate('/chat')}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {chatMessages.map((message, index) => {
          const isOwn = message.sender._id === userInfo._id;
          const showAvatar = !isOwn && (
            index === 0 || 
            chatMessages[index - 1].sender._id !== message.sender._id
          );
          
          return (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
            />
          );
        })}
        
        {/* Typing Indicator */}
        {typingUsersInChat.length > 0 && (
          <TypingIndicator users={typingUsersInChat} />
        )}
        
        {/* Auto scroll target */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
      />
    </div>
  );
};

export default ChatWindow;
