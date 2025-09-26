import React from 'react';

const MessageBubble = ({ message, isOwn, showAvatar }) => {
  // Add safety check for message
  if (!message || !message.sender) {
    return null;
  }

  const formatTime = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className={`flex items-end space-x-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for received messages */}
      {!isOwn && (
        <div className="w-6 h-6 rounded-full flex-shrink-0">
          {showAvatar ? (
            message.sender?.profilePic ? (
              <img
                src={message.sender.profilePic}
                alt={message.sender?.name || 'User'}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {message.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )
          ) : (
            <div className="w-6 h-6" />
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        isOwn 
          ? 'bg-blue-500 text-white rounded-br-sm' 
          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
      }`}>
        {/* Reply to message (if exists) */}
        {message.replyTo && (
          <div className="mb-2 p-2 border-l-2 border-gray-300 bg-gray-50 rounded">
            <p className="text-xs text-gray-500 truncate">
              {message.replyTo?.content || 'Message'}
            </p>
          </div>
        )}

        {/* Message content based on type */}
        {(message.type === 'text' || !message.type) && (
          <p className="text-sm break-words">{message.content || ''}</p>
        )}
        
        {message.type === 'image' && (
          <div>
            <img
              src={message.media?.url}
              alt="Shared image"
              className="max-w-full rounded-lg mb-1"
            />
            {message.content && (
              <p className="text-sm break-words">{message.content}</p>
            )}
          </div>
        )}

        {/* Message time and status */}
        <div className={`flex items-center justify-end space-x-1 mt-1 ${
          isOwn ? 'text-blue-100' : 'text-gray-500'
        }`}>
          <span className="text-xs">{formatTime(message.createdAt)}</span>
          
          {/* Message status for own messages */}
          {isOwn && (
            <div className="flex items-center">
              {message.status === 'sent' && (
                <div className="w-3 h-3 rounded-full border border-current opacity-50" />
              )}
              {message.status === 'delivered' && (
                <div className="w-3 h-3 rounded-full bg-current opacity-50" />
              )}
              {message.status === 'read' && (
                <div className="w-3 h-3 rounded-full bg-current" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
