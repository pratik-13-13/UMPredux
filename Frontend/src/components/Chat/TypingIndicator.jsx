import React from 'react';

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].name} is typing...`;
    } else if (users.length === 2) {
      return `${users[0].name} and ${users[1].name} are typing...`;
    } else {
      return `${users[0].name} and ${users.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex items-end space-x-2 justify-start">
      {/* Avatar */}
      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-medium">
          {users[0].name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Typing Indicator Bubble */}
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">{getTypingText()}</span>
          
          {/* Animated dots */}
          <div className="flex space-x-1 ml-2">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
