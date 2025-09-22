import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  sendFollowRequest, 
  unfollowUser, 
  cancelFollowRequest,
  getFollowStatus 
} from '../../Store/Slices/followSlice.js';

const FollowButton = ({ 
  userId, 
  variant = 'default', 
  showUnfollowModal = false,
  className = '' 
}) => {
  const dispatch = useDispatch();
  const { followStatuses, loading } = useSelector(state => state.follow);
  const { userInfo } = useSelector(state => state.user);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const status = followStatuses[userId] || 'follow';

  useEffect(() => {
    if (userId && userId !== userInfo?._id) {
      dispatch(getFollowStatus(userId));
    }
  }, [dispatch, userId, userInfo?._id]);

  if (!userId || userId === userInfo?._id) return null;

  const handleClick = () => {
    if (status === 'following' && showUnfollowModal) {
      setShowConfirm(true);
      return;
    }

    if (status === 'follow') {
      dispatch(sendFollowRequest(userId));
    } else if (status === 'requested') {
      dispatch(cancelFollowRequest(userId));
    } else if (status === 'following') {
      dispatch(unfollowUser(userId));
    }
  };

  const handleUnfollow = () => {
    dispatch(unfollowUser(userId));
    setShowConfirm(false);
  };

  const getButtonText = () => {
    switch (status) {
      case 'following': return variant === 'small' ? 'Following' : 'Following';
      case 'requested': return variant === 'small' ? 'Requested' : 'Requested';
      default: return variant === 'small' ? 'Follow' : 'Follow';
    }
  };

  const getButtonStyle = () => {
    const baseStyle = variant === 'small' 
      ? 'px-3 py-1 text-xs rounded-md font-medium transition-colors'
      : 'px-4 py-1.5 text-sm rounded-md font-medium transition-colors';

    switch (status) {
      case 'following':
        return `${baseStyle} bg-gray-100 text-black hover:bg-gray-200 ${className}`;
      case 'requested':
        return `${baseStyle} bg-gray-100 text-black hover:bg-gray-200 ${className}`;
      default:
        return `${baseStyle} bg-blue-500 text-white hover:bg-blue-600 ${className}`;
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={getButtonStyle()}
      >
        {loading ? 'Loading...' : getButtonText()}
      </button>

      {/* Unfollow Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="p-6 text-center">
              <p className="text-lg font-semibold mb-4">Unfollow user?</p>
              <div className="space-y-2">
                <button
                  onClick={handleUnfollow}
                  className="w-full py-3 text-red-500 font-semibold hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  Unfollow
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="w-full py-3 text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FollowButton;
