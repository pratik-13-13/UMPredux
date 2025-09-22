import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFollowers, getFollowing, clearFollowData } from '../../Store/Slices/followSlice';
import UserCard from './UserCard';
import { IoClose } from 'react-icons/io5';

const FollowersModal = ({ 
  isOpen, 
  onClose, 
  userId, 
  initialTab = 'followers',
  userName = 'User'
}) => {
  const dispatch = useDispatch();
  const { followers, following, loading } = useSelector((state) => state.follow);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen && userId) {
      dispatch(getFollowers({ userId, page: 1 }));
      dispatch(getFollowing({ userId, page: 1 }));
    }
    
    return () => {
      if (!isOpen) {
        dispatch(clearFollowData());
      }
    };
  }, [isOpen, userId, dispatch]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (!isOpen) return null;

  const currentData = activeTab === 'followers' ? followers : following;
  const currentList = currentData?.list || [];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md h-96 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{userName}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoClose size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange('followers')}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === 'followers'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {followers.totalCount} Followers
          </button>
          <button
            onClick={() => handleTabChange('following')}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === 'following'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {following.totalCount} Following
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : currentList.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 text-lg mb-2">
                  No {activeTab} yet
                </div>
                <div className="text-gray-500 text-sm">
                  {activeTab === 'followers' 
                    ? 'When people follow this account, they\'ll appear here.' 
                    : 'When this account follows people, they\'ll appear here.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {currentList.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  variant="modal"
                  showFollowButton={true}
                  onClick={() => {
                    // Navigate to user profile
                    console.log('Navigate to user profile:', user._id);
                    onClose();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
