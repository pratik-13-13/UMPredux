import React from "react";
import { IoArrowBack, IoSend } from "react-icons/io5";
import CommentItem from "./CommentItem";

const CommentsModal = ({ 
  openPost,
  setOpenCommentsPostId,
  token,
  userInfo,
  generateAvatar,
  modalText,
  setModalText,
  dispatch,
  addComment,
  deleteComment,
  editComment,
  showToast,
  swipeState,
  setSwipeState,
  editing,
  setEditing,
  deletedComments,
  setDeletedComments,
  formatTimeAgo
}) => {
  if (!openPost) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
      <div className="bg-white w-full h-5/6 rounded-t-3xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button 
            onClick={() => setOpenCommentsPostId(null)}
            className="p-1"
          >
            <IoArrowBack size={24} className="text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900">Comments</span>
          <div className="w-6"></div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4">
          {(!openPost.comments || openPost.comments.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="text-gray-400 text-lg mb-2">No comments yet</div>
              <div className="text-gray-500 text-sm">Start the conversation.</div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              {openPost.comments
                .filter(c => !deletedComments[c._id])
                .map((comment) => (
                  <CommentItem 
                    key={comment._id || comment.createdAt}
                    comment={comment}
                    openPost={openPost}
                    token={token}
                    generateAvatar={generateAvatar}
                    dispatch={dispatch}
                    deleteComment={deleteComment}
                    editComment={editComment}
                    showToast={showToast}
                    swipeState={swipeState}
                    setSwipeState={setSwipeState}
                    editing={editing}
                    setEditing={setEditing}
                    deletedComments={deletedComments}
                    setDeletedComments={setDeletedComments}
                    formatTimeAgo={formatTimeAgo}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Add Comment Form - Only show if user is logged in */}
        {token && userInfo && (
          <div className="border-t border-gray-200 p-4">
            <form
              className="flex items-center space-x-3"
              onSubmit={(e) => {
                e.preventDefault();
                const text = modalText.trim();
                if (!text) return;
                
                dispatch(addComment({ postId: openPost._id, text }))
                  .unwrap()
                  .then(() => {
                    setModalText("");
                    showToast("Comment added", "success");
                  })
                  .catch((err) => {
                    showToast("Failed to add comment", "error");
                  });
              }}
            >
              <div className={`w-8 h-8 bg-gradient-to-r ${generateAvatar(userInfo).color} rounded-full flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-semibold text-xs">
                  {generateAvatar(userInfo).initials}
                </span>
              </div>
              
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={modalText}
                onChange={(e) => setModalText(e.target.value)}
              />
              
              <button 
                type="submit" 
                disabled={!modalText.trim()}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IoSend 
                  size={20} 
                  className={modalText.trim() ? 'text-blue-500' : 'text-gray-400'} 
                />
              </button>
            </form>
          </div>
        )}

        {/* Login prompt if not logged in */}
        {!token && (
          <div className="border-t border-gray-200 p-4 text-center">
            <p className="text-gray-500 text-sm">Please login to add comments</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsModal;
