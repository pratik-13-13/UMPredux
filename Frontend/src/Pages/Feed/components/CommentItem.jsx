import React from "react";
import { IoHeartOutline } from "react-icons/io5";

const CommentItem = ({ 
  comment,
  openPost,
  token,
  generateAvatar,
  dispatch,
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
  const key = comment._id || comment.createdAt;
  const offset = swipeState[key] || 0;
  const commentUser = comment.userId || {};
  const commentAvatar = generateAvatar(commentUser);

  if (deletedComments[comment._id]) return null;

  return (
    <div className="relative overflow-hidden">
      {/* Swipe backgrounds - Only show if user can edit/delete */}
      {token && comment._id && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-blue-50 flex items-center pl-4">
            <div className="flex items-center gap-2 text-blue-600">
              <span className="text-sm font-medium">Edit</span>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 w-1/2 bg-red-50 flex items-center justify-end pr-4">
            <div className="flex items-center gap-2 text-red-500">
              <span className="text-sm font-medium">Delete</span>
            </div>
          </div>
        </div>
      )}

      {/* Comment Content */}
      <div
        className="flex items-start space-x-3 bg-white py-3 transition-transform duration-150"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={(e) => {
          if (!token || !comment._id) return;
          
          const startX = e.touches[0].clientX;
          const startOffset = swipeState[key] || 0;
          let currentDx = 0;
          
          const move = (ev) => {
            const dx = ev.touches[0].clientX - startX;
            currentDx = dx;
            let next = startOffset + dx;
            next = Math.max(-140, Math.min(140, next));
            setSwipeState((s) => ({ ...s, [key]: next }));
          };
          
          const end = () => {
            const final = startOffset + currentDx;
            if (final >= 90 && comment._id) {
              setDeletedComments((m) => ({ ...m, [comment._id]: true }));
              dispatch(deleteComment({
                postId: openPost._id,
                commentId: comment._id
              }))
                .unwrap()
                .then(() => showToast("Comment deleted", "success"))
                .catch((err) => {
                  showToast(err?.message || 'Not authorized to delete this comment', 'error');
                  setDeletedComments((m) => {
                    const n = { ...m };
                    delete n[comment._id];
                    return n;
                  });
                });
            } else if (final <= -90 && comment._id) {
              setEditing({ commentId: comment._id, text: comment.text });
            }
            setSwipeState((s) => ({ ...s, [key]: 0 }));
            window.removeEventListener('touchmove', move);
            window.removeEventListener('touchend', end);
          };
          
          window.addEventListener('touchmove', move, { passive: true });
          window.addEventListener('touchend', end);
        }}
      >
        <div className={`w-8 h-8 bg-gradient-to-r ${commentAvatar.color} rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-semibold text-xs">
            {commentAvatar.initials}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-sm text-gray-900">
              {commentUser.name || 'User'}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
          
          {editing?.commentId === comment._id ? (
            <form
              className="flex items-center space-x-2 mt-1"
              onSubmit={(e) => {
                e.preventDefault();
                const text = editing.text.trim();
                if (!text) return;
                
                dispatch(editComment({ 
                  postId: openPost._id, 
                  commentId: comment._id, 
                  text 
                }))
                  .unwrap()
                  .then(() => {
                    showToast("Comment updated", "success");
                    setEditing(null);
                  })
                  .catch((err) => {
                    showToast(err?.message || 'Not authorized to edit this comment', 'error');
                  });
              }}
            >
              <input
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editing.text}
                onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                autoFocus
              />
              <button 
                type="button" 
                onClick={() => setEditing(null)}
                className="text-sm text-gray-500 px-2"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="text-sm text-blue-600 font-medium px-2"
              >
                Save
              </button>
            </form>
          ) : (
            <div className="text-sm text-gray-900">{comment.text}</div>
          )}
        </div>
        
        <button className="text-gray-400 hover:text-red-500 p-1">
          <IoHeartOutline size={16} />
        </button>
      </div>
    </div>
  );
};

export default CommentItem;
