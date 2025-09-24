import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../../Styles/Feed.css"
import { fetchPosts, toggleLike, addComment, deleteComment, editComment, deletePost } from "../../Store/Slices/postSlice.js";
import { fetchStoriesByUser, deleteStory } from "../../Store/Slices/storySlice.js";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/Layout/BottomNav/BottomNav.jsx";

// Import all separated components
import Header from "./components/Header.jsx";
import StoriesSection from "./components/StoriesSection.jsx";
import PostCard from "./Components/PostCard.jsx";
import CommentsModal from "./components/CommentsModal.jsx";
import DeleteModal from "./components/DeleteModal.jsx";
import Toast from "./components/Toast";

// NEW: Import Follow components
import { SuggestionsList } from "../../components/Follow";

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
  
  // Delete post states
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

  // Delete post handler
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
          state: { storiesData: userStories }
        });
      }
    } else {
      navigate(`/story/${userId}`, { 
        state: { storiesData: userStories }
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Instagram Header */}
      <Header />

      {/* UPDATED: Instagram-style Layout */}
      <div className="max-w-lg mx-auto md:max-w-6xl md:px-4">
        <div className="md:flex md:gap-8 md:justify-center">
          {/* Main Feed Content */}
          <div className="w-full md:max-w-lg">
            {/* Stories Section - Instagram Style */}
            <div className="border-b border-gray-200 bg-white">
              <StoriesSection 
                userInfo={userInfo}
                otherUsersWithStories={otherUsersWithStories}
                currentUserStories={currentUserStories}
                generateAvatar={generateAvatar}
                handleStoryClick={handleStoryClick}
                handleDeleteStoryFromFeed={handleDeleteStoryFromFeed}
              />
            </div>

            {/* Feed Posts - No spacing between posts like Instagram */}
            <div className="pb-20 md:pb-0">
              {loading && posts.length === 0 && (
                <div className="flex justify-center items-center h-64 bg-white">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-pink-500"></div>
                </div>
              )}
              
              {!loading && posts.length === 0 && (
                <div className="text-center py-20 bg-white">
                  <div className="text-gray-400 text-lg mb-2">No posts yet</div>
                  <div className="text-gray-500 text-sm">Follow people to see their posts</div>
                </div>
              )}

              {posts.map((post) => (
                <PostCard 
                  key={post._id}
                  post={post}
                  userInfo={userInfo}
                  dispatch={dispatch}
                  toggleLike={toggleLike}
                  setOpenCommentsPostId={setOpenCommentsPostId}
                  token={token}
                  formatTimeAgo={formatTimeAgo}
                  generateAvatar={generateAvatar}
                  showDropdown={showDropdown}
                  setShowDropdown={setShowDropdown}
                  setShowDeleteConfirm={setShowDeleteConfirm}
                />
              ))}
            </div>
          </div>
          
          {/* Desktop Sidebar - Only show on desktop */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-20 space-y-4">
              {/* User Profile Info Card */}
              {userInfo && (
                <div className="bg-white p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-14 h-14 bg-gradient-to-r ${generateAvatar(userInfo).color} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-semibold text-lg">
                        {generateAvatar(userInfo).initials}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{userInfo.name}</h3>
                      <p className="text-gray-500 text-sm">{userInfo.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Follow Suggestions */}
              <SuggestionsList 
                title="Suggested for you"
                limit={5}
                variant="sidebar"
              />

              {/* Footer Links (Instagram-style) */}
              <div className="text-xs text-gray-400 px-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <span>About</span>
                    <span>Help</span>
                    <span>Press</span>
                    <span>API</span>
                    <span>Jobs</span>
                    <span>Privacy</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <span>Terms</span>
                    <span>Locations</span>
                    <span>Language</span>
                    <span>Meta Verified</span>
                  </div>
                  <div className="mt-4">
                    <span>© 2024 Instagram Clone</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal 
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        handleDeletePost={handleDeletePost}
        deleting={deleting}
      />

      {/* Comments Modal */}
      <CommentsModal 
        openPost={openPost}
        setOpenCommentsPostId={setOpenCommentsPostId}
        token={token}
        userInfo={userInfo}
        generateAvatar={generateAvatar}
        modalText={modalText}
        setModalText={setModalText}
        dispatch={dispatch}
        addComment={addComment}
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

      {/* Toast Notifications */}
      <Toast 
        toast={toast}
        setToast={setToast}
      />

      {/* Bottom Navigation - Only show on mobile */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default Feed;
