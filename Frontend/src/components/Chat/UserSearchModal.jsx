import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IoCloseOutline, IoSearchOutline } from 'react-icons/io5';
import { createOrGetChat } from '../../Store/Slices/chatSlice.js';

const UserSearchModal = ({ onClose, onUserSelect }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ✅ FIXED: Get both userInfo and token from state.user
  const { userInfo, token } = useSelector(state => state.user);

  // ✅ FIXED: Search users function with correct token access
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // ✅ FIXED: Get token from correct sources based on your Redux state
      const authToken = token || 
                       userInfo?.token ||
                       localStorage.getItem('authToken') ||  // This exists in your localStorage
                       localStorage.getItem('token');

      
      if (!authToken) {
        console.error('🔍 No token - user needs to login');
        setSearchResults([]);
        return;
      }

      // ✅ FIXED: Correct API endpoint (changed from 'q' to 'query' parameter)
      const response = await fetch(`http://localhost:5000/api/users/search?query=${query}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
      });

      
      if (response.ok) {
        const users = await response.json();
        // Filter out current user
        const filteredUsers = users.filter(user => user._id !== userInfo._id);
        setSearchResults(filteredUsers);
      } else {
        console.error('🔍 Search API error:', response.status, response.statusText);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, token]); // ✅ FIXED: Added token dependency

  // Handle user selection
  const handleUserSelect = async (userId) => {
    try {
      const result = await dispatch(createOrGetChat(userId)).unwrap();
      onClose();
      navigate(`/chat/${result._id}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="bg-white h-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IoCloseOutline size={24} className="text-gray-800" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">New Message</h2>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <IoSearchOutline 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search people..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border-none outline-none text-gray-800 placeholder-gray-500"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : searchTerm && searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user._id)}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {/* Profile Picture */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mr-3 flex-shrink-0">
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    {user.bio && (
                      <p className="text-xs text-gray-400 truncate mt-1">{user.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoSearchOutline size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500">Search for people to start a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
