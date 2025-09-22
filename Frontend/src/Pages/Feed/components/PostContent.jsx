import React from "react";

const PostContent = ({ 
  post, 
  formatTimeAgo, 
  setOpenCommentsPostId 
}) => {
  const likeCount = (post.likes || []).length;
  const commentCount = (post.comments || []).length;
  const postUser = post.userId || {};
  
  return (
    <div className="px-3 py-2">
      {/* Like Count - Only show if there are likes */}
      {likeCount > 0 && (
        <div className="text-sm font-semibold text-gray-900 mb-1">
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </div>
      )}

      {/* Post Caption */}
      <div className="text-sm text-gray-900 mb-2">
        <span className="font-semibold mr-2">{postUser.name || "Unknown"}</span>
        <span>{post.content}</span>
      </div>

      {/* Comments Preview - Only show if there are comments */}
      {commentCount > 0 && (
        <>
          <button 
            onClick={() => setOpenCommentsPostId(post._id)}
            className="text-sm text-gray-500 mb-2"
          >
            View all {commentCount} comments
          </button>
          {/* Show first 2 comments */}
          {post.comments && post.comments.slice(0, 2).map((comment) => (
            <div key={comment._id || comment.createdAt} className="text-sm text-gray-900 mb-1">
              <span className="font-semibold mr-2">{comment.userId?.name || 'User'}</span>
              <span>{comment.text}</span>
            </div>
          ))}
        </>
      )}

      {/* Time Posted */}
      <div className="text-xs text-gray-400 mt-2">
        {formatTimeAgo(post.createdAt)}
      </div>
    </div>
  );
};

export default PostContent;
