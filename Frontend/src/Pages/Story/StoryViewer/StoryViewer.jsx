import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { viewStory, deleteStory, fetchStoriesByUser } from "../../../Store/Slices/storySlice";
import {
  IoClose,
  IoChevronBack,
  IoChevronForward,
  IoEye,
  IoTrash
} from "react-icons/io5";

const StoryViewer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();

  // ✅ USE: Redux state instead of navigation state for real-time updates
  const { userStories } = useSelector((state) => state.stories);
  const { userInfo } = useSelector((state) => state.user);

  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  // ✅ ADDED: Track viewed stories to prevent multiple API calls
  const viewedStories = useRef(new Set());

  // ✅ FETCH: Stories on component mount to ensure fresh data
  useEffect(() => {
    dispatch(fetchStoriesByUser());
  }, [dispatch]);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Find initial user and story indices
  useEffect(() => {
    if (userId && userStories.length > 0) {
      const userIndex = userStories.findIndex(
        group => group._id._id === userId
      );
      if (userIndex !== -1) {
        setCurrentUserIndex(userIndex);
        setCurrentStoryIndex(0);
      }
    }
  }, [userId, userStories]);

  const currentUserStories = userStories[currentUserIndex];
  const currentStory = currentUserStories?.stories[currentStoryIndex];

  // Auto-progress story
  useEffect(() => {
    if (isPaused || !currentStory) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentStoryIndex, currentUserIndex, isPaused, currentStory]);

  // ✅ FIXED: Track story view when story changes - PREVENT MULTIPLE CALLS
  useEffect(() => {
    if (currentStory && userInfo) {
      const storyId = currentStory._id;
      
      // ✅ CHECK: If story already viewed in this session, don't call API again
      if (viewedStories.current.has(storyId)) {
        return;
      }

      
      // ✅ MARK: As viewed immediately to prevent duplicate calls
      viewedStories.current.add(storyId);
      
      // ✅ CALL: API only once
      dispatch(viewStory(storyId));
    }
  }, [currentStory, dispatch, userInfo]);

  // ✅ RESET: Viewed stories when component unmounts
  useEffect(() => {
    return () => {
      viewedStories.current.clear();
    };
  }, []);

  const handleDeleteStory = async () => {
    try {
      await dispatch(deleteStory(currentStory._id)).unwrap();
      setShowDeleteConfirm(false);
      
      if (currentStoryIndex < currentUserStories.stories.length - 1) {
        nextStory();
      } else if (currentUserIndex < userStories.length - 1) {
        nextUser();
      } else {
        navigate('/feed');
      }
      
      showToast("Story deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete story", "error");
      setShowDeleteConfirm(false);
    }
  };

  const nextStory = () => {
    const isOwnStory = currentUserStories._id._id === userInfo?._id;
    
    if (currentStoryIndex < currentUserStories.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      if (isOwnStory) {
        navigate('/feed');
      } else {
        nextUser();
      }
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else {
      prevUser();
    }
  };

  const nextUser = () => {
    if (currentUserIndex < userStories.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      navigate('/feed');
    }
  };

  const prevUser = () => {
    if (currentUserIndex > 0) {
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    }
  };

  const generateAvatar = (user) => {
    if (!user) return { initials: 'U', color: 'from-gray-400 to-gray-500' };
    const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'U';
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600'
    ];
    const colorIndex = user._id ? user._id.charCodeAt(user._id.length - 1) % colors.length : 0;
    return { initials, color: colors[colorIndex] };
  };

  if (!currentStory || !currentUserStories) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading stories...</div>
      </div>
    );
  }

  const userAvatar = generateAvatar(currentUserStories._id);
  
  // ✅ KEPT: Original viewer count logic - NO CHANGES
  const uniqueViewers = currentStory.viewers?.filter((viewer, index, self) =>
    index === self.findIndex(v => v._id === viewer._id)
  ) || [];
  const viewerCount = uniqueViewers.length;


  return (
    <div className="h-screen bg-black relative">
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex space-x-1 p-2">
        {currentUserStories.stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: `${index < currentStoryIndex
                    ? 100
                    : index === currentStoryIndex
                      ? progress
                      : 0
                  }%`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-20 mt-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${userAvatar.color} rounded-full flex items-center justify-center`}>
              <span className="text-white font-semibold text-xs">
                {userAvatar.initials}
              </span>
            </div>
            <div>
              <span className="text-white font-semibold text-sm">
                {currentUserStories._id.name}
              </span>
              <div className="text-white/70 text-xs">
                {new Date(currentStory.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentUserStories._id._id === userInfo?._id && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-600/80 transition-colors"
              >
                <IoTrash size={18} />
              </button>
            )}
            
            <button
              onClick={() => navigate('/feed')}
              className="text-white p-2"
            >
              <IoClose size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div
        className="h-full relative cursor-pointer"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
      >
        <img
          src={currentStory.image}
          alt="Story"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Image failed to load:', currentStory.image);
            e.target.style.display = 'none';
            const errorDiv = document.createElement('div');
            errorDiv.className = 'w-full h-full bg-gray-900 flex items-center justify-center text-white';
            errorDiv.innerHTML = '<p>Image failed to load</p>';
            e.target.parentNode.appendChild(errorDiv);
          }}
          onLoad={() => {
          }}
        />

        {currentStory.content && (
          <div className="absolute bottom-32 left-4 right-4">
            <p className="text-white text-lg shadow-lg">
              {currentStory.content}
            </p>
          </div>
        )}

        {/* Navigation Areas */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full" onClick={prevStory} />
          <div className="w-1/3 h-full" />
          <div className="w-1/3 h-full" onClick={nextStory} />
        </div>
      </div>

      {/* ✅ KEPT: Original viewer functionality - NO CHANGES */}
      {currentUserStories._id._id === userInfo?._id && (
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => setShowViewers(!showViewers)}
            className="flex items-center space-x-2 text-white/80 text-sm bg-black/50 px-3 py-2 rounded-lg"
          >
            <IoEye size={16} />
            <span>Seen by {viewerCount} {viewerCount === 1 ? 'person' : 'people'}</span>
          </button>

          {showViewers && viewerCount > 0 && (
            <div className="mt-2 bg-black/90 backdrop-blur-md rounded-lg p-3 max-h-48 overflow-y-auto">
              <div className="text-white text-sm font-semibold mb-3">
                Story viewers ({viewerCount})
              </div>
              {uniqueViewers.map((viewer) => (
                <div key={viewer._id} className="flex items-center space-x-3 text-white text-sm py-2 border-b border-gray-700/50 last:border-b-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold">
                      {viewer.name?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="flex-1">{viewer.name || 'Unknown User'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Story?</h3>
            <p className="text-gray-600 mb-6">
              This story will be deleted permanently and can't be recovered.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStory}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
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
    </div>
  );
};

export default StoryViewer;
