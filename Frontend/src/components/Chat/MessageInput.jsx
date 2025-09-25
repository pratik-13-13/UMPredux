import React, { useState, useRef, useEffect } from 'react';
import { IoSendOutline, IoHappyOutline, IoImageOutline } from 'react-icons/io5';

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Common emojis (Instagram-style)
  const commonEmojis = [
    '❤️', '😂', '😍', '😊', '😎', '🤔', '😴', '😭',
    '🔥', '👍', '👎', '👏', '🙌', '💯', '🎉', '💪',
    '😘', '😜', '🤗', '🤩', '😇', '🥺', '😋', '🤤'
  ];

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      onTyping?.(false);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping?.(false);
      }, 2000);
    }
  };

  // Handle send message
  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      onTyping?.(false);
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Add emoji to message
  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="mb-3 p-3 bg-gray-50 rounded-2xl">
          <div className="grid grid-cols-8 gap-2">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => addEmoji(emoji)}
                className="text-2xl p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end space-x-3">
        {/* Emoji Button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`p-2 rounded-full transition-colors ${
            showEmojiPicker 
              ? 'bg-blue-100 text-blue-500' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <IoHappyOutline size={24} />
        </button>

        {/* Message Input Container */}
        <div className="flex-1 min-h-[40px] max-h-[120px] bg-gray-100 rounded-2xl flex items-center">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Message..."
            className="flex-1 bg-transparent border-none outline-none resize-none px-4 py-2 text-sm placeholder-gray-500 max-h-[120px]"
            rows={1}
            style={{ minHeight: '40px' }}
          />
          
          {/* Image Upload Button */}
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <IoImageOutline size={20} />
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className={`p-2 rounded-full transition-colors ${
            message.trim()
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          <IoSendOutline size={20} />
        </button>
      </div>

      {/* Character count (optional) */}
      {message.length > 500 && (
        <div className="text-xs text-gray-500 text-right mt-1">
          {message.length}/1000
        </div>
      )}
    </div>
  );
};

export default MessageInput;
