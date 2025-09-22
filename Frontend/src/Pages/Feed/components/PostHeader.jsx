import React from "react";
import { IoEllipsisHorizontal, IoTrash } from "react-icons/io5";

// NEW: Import Follow Button
import { FollowButton } from "../../../components/Follow";

const PostHeader = ({ 
  post, 
  userInfo, 
  formatTimeAgo, 
  generateAvatar,
  showDropdown,
  setShowDropdown,
  setShowDeleteConfirm
}) => {
  const postUser = post.userId || {};
  const userAvatar = generateAvatar(postUser);
  
  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 bg-gradient-to-r ${userAvatar.color} rounded-full flex items-center justify-center`}>
          <span className="text-white font-semibold text-xs">
            {userAvatar.initials}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="font-semibold text-sm text-gray-900">
            {postUser.name || "Unknown"}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-xs text-gray-500">
            {formatTimeAgo(post.createdAt)}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* NEW: Add follow button for posts from other users */}
        <FollowButton 
          userId={post.userId._id} 
          variant="small"
          showUnfollowModal={true}
        />
        
        {/* Options dropdown (only show for post owner) */}
        {userInfo && post.userId._id === userInfo._id && (
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(showDropdown === post._id ? null : post._id)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IoEllipsisHorizontal size={16} className="text-gray-600" />
            </button>
            
            {showDropdown === post._id && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px] z-10">
                <button 
                  onClick={() => {
                    setShowDeleteConfirm(post._id);
                    setShowDropdown(null);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 transition-colors"
                >
                  <IoTrash size={16} />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Show options for non-owners (but no delete option) */}
        {(!userInfo || post.userId._id !== userInfo._id) && (
          <IoEllipsisHorizontal size={16} className="text-gray-600" />
        )}
      </div>
    </div>
  );
};

export default PostHeader;
