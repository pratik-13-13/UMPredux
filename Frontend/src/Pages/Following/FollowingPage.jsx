import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFollowing } from '../../Store/Slices/followSlice.js';
import FollowButton from '../../components/Follow/FollowButton.jsx';
import BottomNav from '../../components/Layout/BottomNav/BottomNav.jsx';

const Following = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { following, loading } = useSelector(state => state.follow);
  const { userInfo } = useSelector(state => state.user);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (userId) {
      dispatch(getFollowing({ userId, page: currentPage }));
    }
  }, [dispatch, userId, currentPage]);

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

  const handleUserClick = (clickedUserId) => {
    if (clickedUserId === userInfo?._id) {
      navigate('/profile');
    } else {
      navigate(`/profile/${clickedUserId}`);
    }
  };

  const loadMoreFollowing = () => {
    if (currentPage < following.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
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
          <h1 className="text-lg font-semibold">
            Following ({following.totalCount || 0})
          </h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto">
        {loading && following.list?.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-pink-500"></div>
          </div>
        ) : following.list?.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-2">Not following anyone yet</div>
            <div className="text-gray-500 text-sm">When you follow people, they'll appear here.</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {following.list?.map((followingUser) => {
              const avatar = generateAvatar(followingUser);
              const isOwnProfile = followingUser._id === userInfo?._id;
              
              return (
                <div key={followingUser._id} className="flex items-center justify-between p-4">
                  <button
                    onClick={() => handleUserClick(followingUser._id)}
                    className="flex items-center space-x-3 flex-1 text-left"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${avatar.color} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-semibold text-sm">
                        {avatar.initials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{followingUser.name}</h3>
                      <p className="text-gray-500 text-sm truncate">{followingUser.email}</p>
                    </div>
                  </button>
                  
                  {/* Show follow button only if not own profile */}
                  {!isOwnProfile && (
                    <div className="ml-3">
                      <FollowButton 
                        userId={followingUser._id}
                        variant="small"
                        showUnfollowModal={true}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Load More Button */}
            {currentPage < following.totalPages && (
              <div className="p-4">
                <button
                  onClick={loadMoreFollowing}
                  disabled={loading}
                  className="w-full py-2 text-blue-500 font-medium hover:bg-blue-50 transition-colors rounded-lg"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Following;
