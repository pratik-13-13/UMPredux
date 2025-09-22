import React from "react";
import { IoAddOutline, IoTrash } from "react-icons/io5";

const StoriesSection = ({ 
  userInfo, 
  otherUsersWithStories, 
  currentUserStories, 
  generateAvatar, 
  handleStoryClick, 
  handleDeleteStoryFromFeed 
}) => {
  return (
    <>
      {/* Stories Section - Dynamic with "Your Story" always first */}
      {(userInfo || otherUsersWithStories.length > 0) && (
        <div className="">
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
    </>
  );
};

export default StoriesSection;
