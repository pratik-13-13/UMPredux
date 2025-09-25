import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IoArrowBackOutline, IoSearchOutline } from 'react-icons/io5';
import { createOrGetChat } from '../../Store/Slices/chatSlice';

const NewChat = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userInfo } = useSelector(state => state.user);

  // Mock search function (you can replace with real API call)
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const token = userInfo?.token || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/search?q=${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const users = await response.json();
        setSearchResults(users.filter(user => user._id !== userInfo._id));
      }
    } catch (error) {
      console.error('Search error:', error);
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
  }, [searchTerm]);

  const handleStartChat = async (userId) => {
    try {
      const result = await dispatch(createOrGetChat(userId)).unwrap();
      navigate(`/chat/${result._id}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/chat')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IoArrowBackOutline size={24} className="text-gray-800" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">New Message</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
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
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-none outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="px-4 py-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-1">
            {searchResults.map((user) => (
              <div
                key={user._id}
                onClick={() => handleStartChat(user._id)}
                className="flex items-center px-3 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              >
                {/* Profile Picture */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mr-3">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Search for people to start a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewChat;
