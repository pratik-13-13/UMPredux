import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../../Styles/Feed.css"
import { fetchPosts, toggleLike, addComment, deleteComment, editComment, deletePost } from "../../Store/Slices/postSlice.js";
import { fetchStoriesByUser, deleteStory } from "../../Store/Slices/storySlice.js";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/Layout/BottomNav/BottomNav.jsx";
import { 
  IoHeartOutline, 
  IoHeart, 
  IoChatbubbleOutline, 
  IoPaperPlaneOutline,
  IoBookmarkOutline,
  IoEllipsisHorizontal,
  IoClose,
  IoArrowBack,
  IoSend,
  IoAddOutline,
  IoTrash 
} from "react-icons/io5";

const Feed = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: posts, loading, deleting } = useSelector((state) => state.posts);
  const { userInfo, token } = useSelector((state) => state.user);
  const { userStories, loading: storiesLoading } = useSelector((state) => state.stories);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [modalText, setModalText] = useState("");
  const [swipeState, setSwipeState] = useState({});
  const [editing, setEditing] = useState(null);
  const [deletedComments, setDeletedComments] = useState({});
  const [toast, setToast] = useState(null);
  const [allStoriesData, setAllStoriesData] = useState(null);
  
  // ✅ ADD: Delete post states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);

  const openPost = useMemo(() => posts.find(p => p._id === openCommentsPostId), [posts, openCommentsPostId]);
  
  // Check if current user has stories - WITH NULL CHECKS
  const currentUserStories = useMemo(() => {
    if (!userInfo?._id || !Array.isArray(userStories)) return null;
    return userStories.find(group => group?._id?._id === userInfo._id);
  }, [userStories, userInfo]);

  const otherUsersWithStories = useMemo(() => {
    if (!Array.isArray(userStories)) return [];
    if (!userInfo?._id) return userStories;
    return userStories.filter(group => group?._id?._id && group._id._id !== userInfo._id);
  }, [userStories, userInfo]);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([
          dispatch(fetchPosts()),
          dispatch(fetchStoriesByUser())
        ]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchAllData();
  }, [dispatch]);

  const handleDeleteStoryFromFeed = async (storyId) => {
    try {
      await dispatch(deleteStory(storyId)).unwrap();
      showToast("Story deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete story", "error");
    }
  };

  // ✅ ADD: Delete post handler
  const handleDeletePost = async (postId) => {
    try {
      await dispatch(deletePost(postId)).unwrap();
      setShowDeleteConfirm(null);
      setShowDropdown(null);
      showToast("Post deleted successfully", "success");
    } catch (error) {
      console.error('Failed to delete post:', error);
      showToast("Failed to delete post", "error");
    }
  };
  
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  // Generate avatar with initials and consistent colors
  const generateAvatar = (user) => {
    if (!user) return { initials: 'U', color: 'from-gray-400 to-gray-500' };
    
    const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'U';
    
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600', 
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600'
    ];
    
    const colorIndex = user._id ? user._id.charCodeAt(user._id.length - 1) % colors.length : 0;
    
    return {
      initials,
      color: colors[colorIndex]
    };
  };

  // Handle story navigation - WITH NULL CHECKS
  const handleStoryClick = (userId) => {
    if (!userId) return;
    
    if (userId === userInfo?._id) {
      if (!currentUserStories || currentUserStories.stories?.length === 0) {
        navigate('/create-story');
      } else {
        navigate(`/story/${userId}`, { 
          state: { storiesData: userStories } // PASS CURRENT REDUX STATE
        });
      }
    } else {
      navigate(`/story/${userId}`, { 
        state: { storiesData: userStories } //  PASS CURRENT REDUX STATE
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Instagram Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            Instagram
          </h1>
          <div className="flex items-center space-x-4">
            <button>
              <IoPaperPlaneOutline size={24} className="text-gray-800" />
            </button>
          </div>
        </div>
      </div>

      {/* Stories Section - Dynamic with "Your Story" always first */}
      {(userInfo || otherUsersWithStories.length > 0) && (
        <div className="border-b border-gray-200 py-4">
          <div className="flex space-x-4 px-4 overflow-x-auto scrollbar-hide">
            
            {/* Current User's Story - Always shows first - WITH NULL CHECKS */}
            {userInfo && (
              <div className="flex flex-col items-center space-y-1 flex-shrink-0 group relative">
                <button
                  onClick={() => handleStoryClick(userInfo._id)}
                  className="relative"
                >
                  {/* Story Ring - Different styles for has/no stories */}
                  <div className={`w-16 h-16 rounded-full p-0.5 ${
                    currentUserStories && currentUserStories.stories?.length > 0
                      ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-red-500' // Has stories
                      : 'bg-gray-300' // No stories
                  }`}>
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                      <div className={`w-12 h-12 bg-gradient-to-r ${generateAvatar(userInfo).color} rounded-full flex items-center justify-center relative`}>
                        <span className="text-white font-semibold text-xs">
                          {generateAvatar(userInfo).initials}
                        </span>
                        
                        {/* Plus icon for "Add Your Story" */}
                        {(!currentUserStories || currentUserStories.stories?.length === 0) && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                            <IoAddOutline size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
                {/* ✅ FIXED: Delete button for own stories (shown on hover) */}
                {currentUserStories && currentUserStories.stories?.length > 0 && (
                  <button
                    onClick={() => handleDeleteStoryFromFeed(currentUserStories.latestStory._id)}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <IoTrash size={12} className="text-white" />
                  </button>
                )}
                
                <span className="text-xs text-gray-600 max-w-[60px] truncate">
                  {currentUserStories && currentUserStories.stories?.length > 0
                    ? 'Your story'
                    : 'Add story'
                  }
                </span>
              </div>
            )}

            {/* Other Users' Stories - WITH NULL CHECKS */}
            {otherUsersWithStories.map((userGroup) => (
              <div key={userGroup?._id?._id || Math.random()} className="flex flex-col items-center space-y-1 flex-shrink-0">
                <button
                  onClick={() => handleStoryClick(userGroup?._id?._id)}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-red-500 p-0.5">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                      <div className={`w-12 h-12 bg-gradient-to-r ${generateAvatar(userGroup._id).color} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-semibold text-xs">
                          {generateAvatar(userGroup._id).initials}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
                <span className="text-xs text-gray-600 max-w-[60px] truncate">
                  {userGroup._id?.name || 'User'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feed Content */}
      <div className="pb-20">
        {loading && posts.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-pink-500"></div>
          </div>
        )}
        
        {!loading && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-2">No posts yet</div>
            <div className="text-gray-500 text-sm">Follow people to see their posts</div>
          </div>
        )}

        {posts.map((post) => {
          const isLiked = (post.likes || []).some((id) => id === userInfo?._id);
          const likeCount = (post.likes || []).length;
          const commentCount = (post.comments || []).length;
          const postUser = post.userId || {};
          const userAvatar = generateAvatar(postUser);
          
          return (
            <div key={post._id} className="bg-white border-b border-gray-100">
              {/* Post Header */}
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
                
                {/* ✅ ADD: Options dropdown (only show for post owner) */}
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

              {/* Post Image - Only show if image exists */}
              {post.image && (
                <div className="w-full aspect-square bg-gray-100">
                  <img 
                    src={post.image} 
                    alt="Post content" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => dispatch(toggleLike(post._id))}
                      className="transition-transform active:scale-125"
                      disabled={!token}
                    >
                      {isLiked ? (
                        <IoHeart size={24} className="text-red-500" />
                      ) : (
                        <IoHeartOutline size={24} className="text-gray-900" />
                      )}
                    </button>
                    <button onClick={() => setOpenCommentsPostId(post._id)}>
                      <IoChatbubbleOutline size={24} className="text-gray-900" />
                    </button>
                    <button>
                      <IoPaperPlaneOutline size={24} className="text-gray-900" />
                    </button>
                  </div>
                  <button>
                    <IoBookmarkOutline size={24} className="text-gray-900" />
                  </button>
                </div>

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
            </div>
          );
        })}
      </div>

      {/* ✅ ADD: Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Post?</h3>
            <p className="text-gray-600 mb-6">
              This post will be deleted permanently and can't be recovered.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(showDeleteConfirm)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {openPost && (
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
                    .map((comment) => {
                      const key = comment._id || comment.createdAt;
                      const offset = swipeState[key] || 0;
                      const commentUser = comment.userId || {};
                      const commentAvatar = generateAvatar(commentUser);
                      
                      return (
                        <div key={key} className="relative overflow-hidden">
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
                              
                              const startX = e.touches.clientX;
                              const startOffset = swipeState[key] || 0;
                              let currentDx = 0;
                              
                              const move = (ev) => {
                                const dx = ev.touches.clientX - startX;
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
                    })}
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
      )}

      {/* Toast Notifications */}
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium flex items-center space-x-2 ${
            toast.type === 'error' ? 'bg-red-500' : 
            toast.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
          }`}>
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <IoClose size={16} />
            </button>
          </div>
        </div>
      )}

      <BottomNav />
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Feed;
