import React from 'react';

const ChatListItem = ({ chat, onClick }) => {
  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInSeconds = Math.floor((now - messageDate) / 1000);
    
    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return messageDate.toLocaleDateString();
  };

  const getLastMessageText = () => {
    if (!chat.lastMessage) return 'Start a conversation';
    
    if (chat.lastMessage.type === 'image') return '📷 Photo';
    if (chat.lastMessage.type === 'file') return '📎 File';
    
    return chat.lastMessage.content;
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      {/* Profile Picture */}
      <div className="relative mr-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
          {chat.profilePic ? (
            <img
              src={chat.profilePic}
              alt={chat.name}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-lg">
              {chat.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          )}
        </div>
        
        {/* Online status dot (you can add online status logic) */}
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 truncate">
            {chat.name || 'Unknown User'}
          </h3>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {chat.lastActivity && formatTime(chat.lastActivity)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 truncate">
            {getLastMessageText()}
          </p>
          
          {/* Unread count badge - Instagram style */}
          {chat.unreadCount > 0 && (
            <div className="bg-blue-500 rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
