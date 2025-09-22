import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  getFollowRequests, 
  acceptFollowRequest, 
  rejectFollowRequest 
} from '../../Store/Slices/followSlice.js';
import BottomNav from '../../components/Layout/BottomNav/BottomNav.jsx';

const FollowRequests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { followRequests, loading } = useSelector(state => state.follow);

  useEffect(() => {
    dispatch(getFollowRequests());
  }, [dispatch]);

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

  const handleAccept = (userId) => {
    dispatch(acceptFollowRequest(userId));
  };

  const handleReject = (userId) => {
    dispatch(rejectFollowRequest(userId));
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Follow Requests</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto">
        {loading && followRequests.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-pink-500"></div>
          </div>
        ) : followRequests.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-2">No follow requests</div>
            <div className="text-gray-500 text-sm">When people request to follow you, they'll appear here.</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {followRequests.map((request) => {
              const user = request.user;
              const avatar = generateAvatar(user);
              
              return (
                <div key={request._id || user._id} className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${avatar.color} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-semibold text-sm">
                        {avatar.initials}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAccept(user._id)}
                      className="px-4 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(user._id)}
                      className="px-4 py-1.5 bg-gray-100 text-black rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default FollowRequests;
