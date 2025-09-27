import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { viewStory, deleteStory, fetchStoriesByUser } from "../../../Store/Slices/storySlice";
import {
  IoClose,
  IoChevronBack,
  IoChevronForward,
  IoEye,
  IoTrash,
  IoPlayOutline,
  IoPauseOutline
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState('');

  // ✅ ADDED: Track viewed stories to prevent multiple API calls
  const viewedStories = useRef(new Set());
  const progressInterval = useRef(null);
  const storyContainer = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

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

  // ✅ ENHANCED: Smooth Instagram-like progress animation
  useEffect(() => {
    if (isPaused || !currentStory || isTransitioning) return;

    // Clear any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    // Reset progress for new story
    setProgress(0);

    // Smooth progress animation (5 seconds per story like Instagram)
    const duration = 5000; // 5 seconds
    const increment = 100 / (duration / 50); // Update every 50ms

    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval.current);
          nextStory();
          return 100;
        }
        return prev + increment;
      });
    }, 50);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentStoryIndex, currentUserIndex, isPaused, currentStory, isTransitioning]);

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

  // ✅ ENHANCED: Smooth story transitions with animations
  const nextStory = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setSlideDirection('slide-left');
    
    setTimeout(() => {
      const isOwnStory = currentUserStories._id._id === userInfo?._id;
      
      if (currentStoryIndex < currentUserStories.stories.length - 1) {
        setCurrentStoryIndex(prev => prev + 1);
        setProgress(0);
      } else {
        if (isOwnStory) {
          navigate('/feed');
          return;
        } else {
          nextUser();
          return;
        }
      }
      
      setTimeout(() => {
        setIsTransitioning(false);
        setSlideDirection('');
      }, 300);
    }, 150);
  };

  const prevStory = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setSlideDirection('slide-right');
    
    setTimeout(() => {
      if (currentStoryIndex > 0) {
        setCurrentStoryIndex(prev => prev - 1);
        setProgress(0);
      } else {
        prevUser();
        return;
      }
      
      setTimeout(() => {
        setIsTransitioning(false);
        setSlideDirection('');
      }, 300);
    }, 150);
  };

  const nextUser = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setSlideDirection('slide-left');
    
    setTimeout(() => {
      if (currentUserIndex < userStories.length - 1) {
        setCurrentUserIndex(prev => prev + 1);
        setCurrentStoryIndex(0);
        setProgress(0);
      } else {
        navigate('/feed');
        return;
      }
      
      setTimeout(() => {
        setIsTransitioning(false);
        setSlideDirection('');
      }, 300);
    }, 150);
  };

  const prevUser = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setSlideDirection('slide-right');
    
    setTimeout(() => {
      if (currentUserIndex > 0) {
        setCurrentUserIndex(prev => prev - 1);
        setCurrentStoryIndex(0);
        setProgress(0);
      }
      
      setTimeout(() => {
        setIsTransitioning(false);
        setSlideDirection('');
      }, 300);
    }, 150);
  };

  // ✅ NEW: Touch/Swipe gesture handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    // Prevent scrolling while swiping
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    
    // Check if it's a horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right - previous story/user
        prevStory();
      } else {
        // Swipe left - next story/user
        nextStory();
      }
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
  
  // ✅ ENHANCED: Handle both old and new viewer formats
  const uniqueViewers = currentStory.viewers?.filter((viewer, index, self) => {
    const viewerId = viewer.userId?._id || viewer._id;
    return index === self.findIndex(v => {
      const vId = v.userId?._id || v._id;
      return vId === viewerId;
    });
  }) || [];
  const viewerCount = currentStory.viewCount || uniqueViewers.length;


  return (
    <>
      {/* ✅ Instagram-like animations styles */}
      <style jsx>{`
        @keyframes slideInLeft {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutLeft {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-100%); opacity: 0; }
        }
        
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        
        .story-enter {
          animation: slideInLeft 0.3s ease-out;
        }
        
        .story-exit {
          animation: slideOutLeft 0.3s ease-out;
        }
        
        .progress-bar {
          animation: progressFill 5s linear;
        }
        
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
      
      <div className="h-screen bg-black relative overflow-hidden">
      {/* ✅ ENHANCED: Instagram-style Progress Bars with smooth animations */}
      <div className="absolute top-0 left-0 right-0 z-20 flex space-x-1 p-2">
        {currentUserStories.stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className={`h-full bg-white rounded-full transition-all ${
                index === currentStoryIndex ? 'duration-75 ease-linear' : 'duration-300 ease-out'
              }`}
              style={{
                width: `${index < currentStoryIndex
                    ? 100
                    : index === currentStoryIndex
                      ? progress
                      : 0
                  }%`,
                transform: index === currentStoryIndex && progress > 0 ? 'scaleX(1)' : 'scaleX(1)',
                transformOrigin: 'left'
              }}
            />
          </div>
        ))}
      </div>

      {/* ✅ ENHANCED: Header with smooth transitions */}
      <div className={`absolute top-4 left-0 right-0 z-20 mt-6 transition-all duration-300 ${
        isTransitioning ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
      }`}>
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            {/* Profile Picture with Instagram-style ring */}
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 via-pink-500 to-red-500 rounded-full p-0.5">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  {currentUserStories._id?.profilePic ? (
                    <img 
                      src={currentUserStories._id.profilePic} 
                      alt={currentUserStories._id.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-6 h-6 bg-gradient-to-r ${userAvatar.color} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-semibold text-xs">
                        {userAvatar.initials}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <span className="text-white font-semibold text-sm drop-shadow-lg">
                {currentUserStories._id.name}
              </span>
              <div className="text-white/70 text-xs drop-shadow-lg">
                {new Date(currentStory.createdAt).toLocaleString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Pause/Play indicator */}
            {isPaused && (
              <div className="p-1 bg-black/30 rounded-full">
                <IoPauseOutline size={16} className="text-white" />
              </div>
            )}
            
            {currentUserStories._id._id === userInfo?._id && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-600/80 transition-all duration-200 hover:scale-110"
              >
                <IoTrash size={18} />
              </button>
            )}
            
            <button
              onClick={() => navigate('/feed')}
              className="text-white p-2 hover:bg-white/10 rounded-full transition-all duration-200"
            >
              <IoClose size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ ENHANCED: Story Content with smooth transitions and gestures */}
      <div
        ref={storyContainer}
        className={`h-full relative cursor-pointer transition-transform duration-300 ease-out ${
          slideDirection === 'slide-left' ? '-translate-x-full' : 
          slideDirection === 'slide-right' ? 'translate-x-full' : 'translate-x-0'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Story Image with smooth loading */}
        <div className="relative w-full h-full bg-gray-900">
          <img
            src={currentStory.image}
            alt="Story"
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
            onError={(e) => {
              console.error('Image failed to load:', currentStory.image);
              e.target.style.display = 'none';
              const errorDiv = document.createElement('div');
              errorDiv.className = 'w-full h-full bg-gray-900 flex items-center justify-center text-white';
              errorDiv.innerHTML = '<p>Image failed to load</p>';
              e.target.parentNode.appendChild(errorDiv);
            }}
          />
          
          {/* Loading overlay during transitions */}
          {isTransitioning && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Story Text Content */}
        {currentStory.content && (
          <div className={`absolute bottom-32 left-4 right-4 transition-all duration-300 ${
            isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}>
            <p className="text-white text-lg shadow-lg font-medium">
              {currentStory.content}
            </p>
          </div>
        )}

        {/* ✅ ENHANCED: Navigation Areas with visual feedback */}
        <div className="absolute inset-0 flex">
          <div 
            className="w-1/3 h-full flex items-center justify-start pl-4 group" 
            onClick={prevStory}
          >
            <IoChevronBack 
              size={24} 
              className="text-white/0 group-active:text-white/50 transition-colors duration-150" 
            />
          </div>
          <div className="w-1/3 h-full flex items-center justify-center">
            {isPaused && (
              <IoPlayOutline size={48} className="text-white/70 animate-pulse" />
            )}
          </div>
          <div 
            className="w-1/3 h-full flex items-center justify-end pr-4 group" 
            onClick={nextStory}
          >
            <IoChevronForward 
              size={24} 
              className="text-white/0 group-active:text-white/50 transition-colors duration-150" 
            />
          </div>
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
              {uniqueViewers.map((viewer) => {
                const user = viewer.userId || viewer;
                const viewedAt = viewer.viewedAt;
                
                return (
                  <div key={user._id} className="flex items-center justify-between text-white text-sm py-2 border-b border-gray-700/50 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      {user.profilePic ? (
                        <img 
                          src={user.profilePic} 
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold">
                            {user.name?.substring(0, 2).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <span className="flex-1">{user.name || 'Unknown User'}</span>
                    </div>
                    {viewedAt && (
                      <span className="text-xs text-gray-400">
                        {new Date(viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                );
              })}
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
    </>
  );
};

export default StoryViewer;
