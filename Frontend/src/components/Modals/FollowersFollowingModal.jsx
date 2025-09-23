import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoArrowBack, IoSearch } from 'react-icons/io5';
import { getFollowers, getFollowing } from '../../Store/Slices/followSlice.js';
import FollowButton from '../Follow/FollowButton.jsx';

const FollowersFollowingModal = ({ isOpen, onClose, userId, userName, initialTab = 'followers' }) => {
  const dispatch = useDispatch();
  const { followers, following, loading } = useSelector(state => state.follow);
  const { userInfo } = useSelector(state => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [filteredData, setFilteredData] = useState([]);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      dispatch(getFollowers({ userId, page: 1, limit: 100 }));
      dispatch(getFollowing({ userId, page: 1, limit: 100 }));
    }
  }, [isOpen, userId, dispatch]);

  // Set initial active tab
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Filter data based on active tab and search
  useEffect(() => {
    let dataToFilter = [];
    
    if (activeTab === 'followers' && followers?.followers) {
      dataToFilter = followers.followers;
    } else if (activeTab === 'following' && following?.following) {
      dataToFilter = following.following;
    }

    if (searchTerm) {
      const filtered = dataToFilter.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(dataToFilter);
    }
  }, [activeTab, followers, following, searchTerm]);

  const generateAvatar = (user) => {
    if (!user) return { initials: 'U', color: 'from-gray-400 to-gray-500' };
    
    const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'U';
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600', 
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600'
    ];
    const colorIndex = user._id ? user._id.charCodeAt(user._id.length - 1) % colors.length : 0;
    
    return { initials, color: colors[colorIndex] };
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm(''); // Clear search when switching tabs
  };

  if (!isOpen) return null;

  const getCurrentCount = () => {
    if (activeTab === 'followers') return followers?.totalCount || 0;
    if (activeTab === 'following') return following?.totalCount || 0;
    return 0;
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Status Bar Space */}
      <div className="h-6 bg-white"></div>
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center px-4 py-3">
          <button 
            onClick={onClose}
            className="mr-4 p-1"
          >
            <IoArrowBack size={24} className="text-gray-900" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{userName || 'User'}</h1>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex">
          <button 
            onClick={() => handleTabChange('followers')}
            className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'followers' 
                ? 'border-gray-900 text-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {followers?.totalCount || 0} followers
          </button>
          <button 
            onClick={() => handleTabChange('following')}
            className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'following' 
                ? 'border-gray-900 text-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {following?.totalCount || 0} following
          </button>
          <button 
            onClick={() => handleTabChange('subscriptions')}
            className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'subscriptions' 
                ? 'border-gray-900 text-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            0 subscriptions
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <IoSearch size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm border-0 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
          </div>
        ) : (
          <div>
            {/* Dynamic Section Based on Active Tab */}
            {activeTab === 'subscriptions' ? (
              <div className="px-4 py-3 bg-white">
                <div className="text-center py-20 text-gray-500">
                  <div className="text-lg font-medium mb-2">No subscriptions yet</div>
                  <div className="text-sm">Subscriptions will appear here when you subscribe to creators.</div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 bg-white">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  All {activeTab}
                </h2>
                
                {filteredData.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    {searchTerm ? `No ${activeTab} found` : `No ${activeTab} yet`}
                  </div>
                ) : (
                  <div className="space-y-0">
                    {filteredData.map((user, index) => {
                      const avatar = generateAvatar(user);
                      const isOwnProfile = user._id === userInfo?._id;
                      
                      return (
                        <div key={user._id} className="flex items-center justify-between py-3">
                          <div className="flex items-center flex-1">
                            {/* Profile Picture */}
                            <div className="flex-shrink-0 mr-3">
                              <div className={`w-11 h-11 bg-gradient-to-r ${avatar.color} rounded-full flex items-center justify-center`}>
                                <span className="text-white font-medium text-sm">
                                  {avatar.initials}
                                </span>
                              </div>
                            </div>
                            
                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                  {user.name}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                {user.email || `${user.name}`}
                              </p>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 ml-3">
                            {!isOwnProfile && (
                              <>
                                <button className="px-6 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors">
                                  Message
                                </button>
                                <FollowButton 
                                  userId={user._id}
                                  variant="small"
                                  showUnfollowModal={true}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowersFollowingModal;
