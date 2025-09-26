import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getChatMessages, sendMessage, addMessage } from '../../Store/Slices/chatSlice.js';
import ChatHeader from '../../components/Chat/ChatHeader.jsx';
import MessageBubble from '../../components/Chat/MessageBubble.jsx';
import MessageInput from '../../components/Chat/MessageInput.jsx';
import TypingIndicator from '../../components/Chat/TypingIndicator.jsx';

const ChatWindow = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const { currentChat, messages, typingUsers, chats } = useSelector(state => state.chat);
  const { userInfo, token } = useSelector(state => state.user);

  const [chatData, setChatData] = useState(null);

  const chatMessages = messages[chatId] || [];
  const typingUsersInChat = typingUsers[chatId] || [];

  // Get chat info from multiple sources
  const chatInfo = chatData || currentChat || chats.find(chat => chat._id === chatId);

  // Fetch specific chat data
  const fetchChatData = async () => {
    try {
      const authToken = token || userInfo?.token || localStorage.getItem('authToken');

      const response = await fetch(`http://192.168.1.154:5000/api/chat/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const chat = await response.json();
        setChatData(chat);
      }
    } catch (error) {
      // Silent error handling - could add error state if needed
    }
  };

  // Socket connection and message handling
  useEffect(() => {
    if (chatId && userInfo?._id) {
      fetchChatData();
      dispatch(getChatMessages({ chatId }));
      
      const connectAndJoin = () => {
        const currentSocket = window.globalSocket;
        
        if (currentSocket && currentSocket.connected) {
          // Join chat room
          currentSocket.emit('joinChat', { chatId, userId: userInfo._id });
          
          const handleNewMessage = (data) => {
            const messageSenderId = data.message?.sender?._id || data.sender?._id;
            const isFromCurrentUser = messageSenderId === userInfo._id;
            
            // Only add message if it's for current chat and not from current user
            if (data.chatId === chatId && !isFromCurrentUser) {
              dispatch(addMessage({ 
                chatId: data.chatId, 
                message: data.message 
              }));
            }
          };
          
          // Remove existing listener to prevent duplicates
          currentSocket.off('newMessage', handleNewMessage);
          currentSocket.on('newMessage', handleNewMessage);
          
          return () => {
            currentSocket.off('newMessage', handleNewMessage);
            currentSocket.emit('leaveChat', { chatId, userId: userInfo._id });
          };
        } else {
          // Retry if socket not ready
          setTimeout(connectAndJoin, 1000);
        }
      };
      
      return connectAndJoin();
    }
  }, [chatId, dispatch, userInfo?._id]);

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
    const socket = window.globalSocket;
    if (socket && socket.connected) {
      const eventType = isTyping ? 'typing' : 'stopTyping';
      socket.emit(eventType, { chatId, user: userInfo });
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
    <div className="flex flex-col h-screen bg-amber-600-100">
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
              key={`${message._id}-${index}`}
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
