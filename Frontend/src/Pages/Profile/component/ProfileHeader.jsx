import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FollowersFollowingModal from '../../../components/Modals/FollowersFollowingModal.jsx';

const ProfileHeader = ({ 
  user, 
  avatar, 
  isEditing, 
  onEditClick,
  postsCount,
  followersCount,
  followingCount 
}) => {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  
  // NEW: Single modal with different initial tabs
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [initialTab, setInitialTab] = useState('followers');

  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.name}'s Profile`,
        text: `Check out ${user.name}'s profile on Instagram`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareModal(true);
      setTimeout(() => setShowShareModal(false), 2000);
    }
  };

  const handleAddToStory = () => {
    navigate('/create-story');
  };

  // NEW: Combined modal handlers
  const handleFollowersClick = () => {
    setInitialTab('followers');
    setShowFollowModal(true);
  };

  const handleFollowingClick = () => {
    setInitialTab('following');
    setShowFollowModal(true);
  };

  return (
    <div className="bg-white">
      {/* Mobile Layout */}
      <div className="md:hidden px-4 py-4">
        {/* Profile Picture and Stats Row */}
        <div className="flex items-center">
          {/* Profile Picture */}
          <div className="relative mr-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-indigo-600">
                  {avatar}
                </div>
              </div>
            </div>
            <button
              onClick={handleAddToStory}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white hover:bg-blue-600 transition-colors"
            >
              <span className="text-white text-sm font-bold">+</span>
            </button>
          </div>
          
          {/* Stats - Same row as Instagram */}
          <div className="flex-1 flex justify-around">
            <div className="text-center">
              <div className="font-semibold text-base">{formatCount(postsCount)}</div>
              <div className="text-gray-600 text-sm">posts</div>
            </div>
            <button 
              onClick={handleFollowersClick}
              className="text-center hover:opacity-70 transition-opacity"
            >
              <div className="font-semibold text-base">{formatCount(followersCount)}</div>
              <div className="text-gray-600 text-sm">followers</div>
            </button>
            <button 
              onClick={handleFollowingClick}
              className="text-center hover:opacity-70 transition-opacity"
            >
              <div className="font-semibold text-base">{formatCount(followingCount)}</div>
              <div className="text-gray-600 text-sm">following</div>
            </button>
          </div>
        </div>
        
        {/* Rest of your existing mobile layout... */}
        <div className="mt-3">
          <h1 className="text-sm font-semibold text-gray-900">{user.username || user.name}</h1>
          <div className="mt-1 text-sm text-gray-700">
            <p className="font-semibold">{user.fullName || user.name}</p>
            {user.bio && <p className="whitespace-pre-wrap">{user.bio}</p>}
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          {!isEditing && (
            <>
              <button
                onClick={onEditClick}
                className="flex-1 py-1.5 bg-gray-100 text-black rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Edit profile
              </button>
              <button 
                onClick={handleShareProfile}
                className="flex-1 py-1.5 bg-gray-100 text-black rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Share profile
              </button>
              <button className="px-3 py-1.5 bg-gray-100 text-black rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </>
          )}
        </div>
        
        <div className="flex gap-4 mt-4 overflow-x-auto scrollbar-hide">
          <button
            onClick={handleAddToStory}
            className="flex flex-col items-center min-w-0 group"
          >
            <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
              <span className="text-2xl text-gray-400">+</span>
            </div>
            <span className="text-xs text-gray-600 mt-1">New</span>
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block px-8 py-8">
        {/* Your existing desktop layout with updated click handlers */}
        <div className="flex items-start">
          <div className="relative mr-12">
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-1">
              <div className="w-full h-full rounded-full bg-white p-1">
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-indigo-600">
                  {avatar}
                </div>
              </div>
            </div>
            <button
              onClick={handleAddToStory}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white hover:bg-blue-600 transition-colors"
            >
              <span className="text-white text-lg font-bold">+</span>
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center mb-6">
              <h1 className="text-2xl font-light mr-8">{user.username || user.name}</h1>
              
              {!isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={onEditClick}
                    className="px-4 py-1.5 bg-gray-100 text-black rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Edit profile
                  </button>
                  <button 
                    onClick={handleShareProfile}
                    className="px-4 py-1.5 bg-gray-100 text-black rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Share profile
                  </button>
                  <button className="px-3 py-1.5 bg-gray-100 text-black rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex gap-12 mb-6">
              <div className="flex items-center">
                <span className="font-semibold text-lg mr-1">{formatCount(postsCount)}</span>
                <span className="text-gray-600">posts</span>
              </div>
              <button 
                onClick={handleFollowersClick}
                className="flex items-center hover:opacity-70 transition-opacity"
              >
                <span className="font-semibold text-lg mr-1">{formatCount(followersCount)}</span>
                <span className="text-gray-600">followers</span>
              </button>
              <button 
                onClick={handleFollowingClick}
                className="flex items-center hover:opacity-70 transition-opacity"
              >
                <span className="font-semibold text-lg mr-1">{formatCount(followingCount)}</span>
                <span className="text-gray-600">following</span>
              </button>
            </div>
            
            <div className="text-sm">
              <p className="font-semibold text-gray-900">{user.fullName || user.name}</p>
              {user.bio && <p className="text-gray-700 mt-1 whitespace-pre-wrap">{user.bio}</p>}
              <p className="text-gray-600 mt-1">{user.email}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-6 mt-8 overflow-x-auto scrollbar-hide">
          <button
            onClick={handleAddToStory}
            className="flex flex-col items-center min-w-0 group"
          >
            <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
              <span className="text-3xl text-gray-400">+</span>
            </div>
            <span className="text-xs text-gray-600 mt-2">New</span>
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Profile link copied to clipboard!
          </div>
        </div>
      )}

      {/* NEW: Single Combined Modal */}
      <FollowersFollowingModal 
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        userId={user._id}
        userName={user.name}
        initialTab={initialTab}
      />
    </div>
  );
};

export default ProfileHeader;
