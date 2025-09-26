import React from "react";
import PostHeader from "./PostHeader";
import PostActions from "./PostActions";
import PostContent from "./PostContent";

const PostCard = ({
  post,
  userInfo,
  dispatch,
  toggleLike,
  setOpenCommentsPostId,
  token,
  formatTimeAgo,
  generateAvatar,
  showDropdown,
  setShowDropdown,
  setShowDeleteConfirm
}) => {
  return (
    <div className="bg-white border-b border-gray-100">
      {/* Post Header */}
      <PostHeader
        post={post}
        userInfo={userInfo}
        formatTimeAgo={formatTimeAgo}
        generateAvatar={generateAvatar}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        setShowDeleteConfirm={setShowDeleteConfirm}
      />

      {/* Post Image - Only show if image exists */}
      {post.image && (
  <div className="w-full aspect-square bg-gray-100">
    <img 
      src={post.image.startsWith('http') ? post.image : `http://192.168.1.154:5000${post.image}`}
      alt="Post content" 
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.style.display = 'none';
      }}
    />
  </div>
)}


      {/* Action Buttons */}
      <PostActions
        post={post}
        userInfo={userInfo}
        dispatch={dispatch}
        toggleLike={toggleLike}
        setOpenCommentsPostId={setOpenCommentsPostId}
        token={token}
      />

      {/* Post Content */}
      <PostContent
        post={post}
        formatTimeAgo={formatTimeAgo}
        setOpenCommentsPostId={setOpenCommentsPostId}
      />
    </div>
  );
};

export default PostCard;
