import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { viewStory, setViewingStory } from "../../Redux/storySlice.js";
import { useNavigate, useParams } from "react-router-dom";
import { IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";

const StoryViewer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();
  
  const { userStories } = useSelector((state) => state.stories);
  const { userInfo } = useSelector((state) => state.user);
  
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Find user stories
  const currentUserStories = userStories[currentUserIndex];
  const currentStory = currentUserStories?.stories[currentStoryIndex];

  useEffect(() => {
    // Find the user index based on userId param
    if (userId) {
      const userIndex = userStories.findIndex(group => group._id._id === userId);
      if (userIndex !== -1) {
        setCurrentUserIndex(userIndex);
      }
    }
  }, [userId, userStories]);

  useEffect(() => {
    if (currentStory) {
      dispatch(viewStory(currentStory._id));
    }
  }, [currentStory, dispatch]);

  // Auto-progress story
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds total (100 * 50ms)

    return () => clearInterval(timer);
  }, [currentStoryIndex, currentUserIndex, isPaused]);

  const nextStory = () => {
    if (currentStoryIndex < currentUserStories.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      nextUser();
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

  // Generate user avatar
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

  if (!currentStory) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading story...</div>
      </div>
    );
  }

  const userAvatar = generateAvatar(currentStory.userId);

  return (
    <div className="h-screen bg-black relative">
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex space-x-1 p-2">
        {currentUserStories.stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: `${
                  index < currentStoryIndex
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
      <div className="absolute top-4 left-0 right-0 z-10 mt-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${userAvatar.color} rounded-full flex items-center justify-center`}>
              <span className="text-white font-semibold text-xs">
                {userAvatar.initials}
              </span>
            </div>
            <div>
              <span className="text-white font-semibold text-sm">
                {currentStory.userId.name}
              </span>
              <div className="text-white/70 text-xs">
                {new Date(currentStory.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/feed')}
            className="text-white p-2"
          >
            <IoClose size={24} />
          </button>
        </div>
      </div>

      {/* Story Content */}
      <div
        className="h-full relative"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
      >
        <img
          src={currentStory.image}
          alt="Story"
          className="w-full h-full object-cover"
        />
        
        {/* Story Text */}
        {currentStory.content && (
          <div className="absolute bottom-20 left-4 right-4">
            <p className="text-white text-lg shadow-lg">
              {currentStory.content}
            </p>
          </div>
        )}

        {/* Navigation Areas */}
        <div className="absolute inset-0 flex">
          <div
            className="w-1/3 h-full flex items-center justify-start pl-4"
            onClick={prevStory}
          >
            <IoChevronBack size={32} className="text-white/50" />
          </div>
          <div className="w-1/3 h-full" />
          <div
            className="w-1/3 h-full flex items-center justify-end pr-4"
            onClick={nextStory}
          >
            <IoChevronForward size={32} className="text-white/50" />
          </div>
        </div>
      </div>

      {/* Story Info */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="text-white/70 text-sm">
          Viewed by {currentStory.viewers?.length || 0} people
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
