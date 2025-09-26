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
  className = '',
  onFollowChange
}) => {
  const dispatch = useDispatch();
  const { followStatuses, followLoading } = useSelector(state => state.follow);
  const { userInfo } = useSelector(state => state.user);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const status = followStatuses[userId] || 'follow';
  const loading = followLoading[userId] || false;

  useEffect(() => {
    if (userId && userId !== userInfo?._id) {
      dispatch(getFollowStatus(userId));
    }
  }, [dispatch, userId, userInfo?._id]);

  if (!userId || userId === userInfo?._id) return null;

  const handleClick = async () => {

     
    if (status === 'following' && showUnfollowModal) {
      setShowConfirm(true);
      return;
    }

    try {
      if (status === 'follow') {
        // ALWAYS send request (not direct follow)
        await dispatch(sendFollowRequest(userId)).unwrap();
        onFollowChange?.(1);
      } else if (status === 'requested') {
        await dispatch(cancelFollowRequest(userId)).unwrap();
        onFollowChange?.(-1);
      } else if (status === 'following') {
        await dispatch(unfollowUser(userId)).unwrap();
        onFollowChange?.(-1);
      }
    } catch (error) {
      console.error('Follow action error:', error);
    }
  };

  const handleUnfollow = async () => {
    try {
      await dispatch(unfollowUser(userId)).unwrap();
      setShowConfirm(false);
      onFollowChange?.(-1);
    } catch (error) {
      console.error('Unfollow error:', error);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Loading...';
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
        {getButtonText()}
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
