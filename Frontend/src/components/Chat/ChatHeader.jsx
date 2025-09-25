import React, { useState } from 'react';
import { IoArrowBackOutline, IoCallOutline, IoVideocamOutline, IoEllipsisHorizontalOutline } from 'react-icons/io5';

const ChatHeader = ({ chat, currentUser, onBack }) => { // ✅ ADDED: currentUser prop
  const [showMenu, setShowMenu] = useState(false);

  const getOtherParticipant = () => {
    if (!chat || !chat.participants || !currentUser) return null;
    
    // ✅ FIXED: Use currentUser._id instead of chat.currentUserId
    return chat.participants.find(p => p._id !== currentUser._id);
  };

  const otherUser = getOtherParticipant();

  console.log('🔍 Debug ChatHeader:');
  console.log('📄 Chat:', chat);
  console.log('👤 Current User:', currentUser);
  console.log('👥 Participants:', chat?.participants);
  console.log('🎯 Other User:', otherUser);

  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Side - Back & User Info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoArrowBackOutline size={24} className="text-gray-800" />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {/* Profile Picture */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
              {otherUser?.profilePic ? (
                <img
                  src={otherUser.profilePic}
                  alt={otherUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold">
                  {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-gray-900 truncate">
                {otherUser?.name || 'Loading...'} {/* ✅ CHANGED: Better fallback text */}
              </h2>
              <p className="text-sm text-gray-500">
                Active now
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <IoCallOutline size={22} className="text-gray-600" />
          </button>
          
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <IoVideocamOutline size={22} className="text-gray-600" />
          </button>
          
          {/* More Options */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IoEllipsisHorizontalOutline size={22} className="text-gray-600" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  View Profile
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  Mute Conversation
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  Delete Conversation
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50">
                  Block User
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default ChatHeader;
