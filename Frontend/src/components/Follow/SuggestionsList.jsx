import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFollowSuggestions } from '../../Store/Slices/followSlice'; // Remove getBatchFollowStatus
import UserCard from './UserCard';

const SuggestionsList = ({ 
  title = "Suggested for you", 
  limit = 5, 
  showTitle = true,
  className = "",
  variant = "sidebar"
}) => {
  const dispatch = useDispatch();
  const { suggestions, loading } = useSelector((state) => state.follow);
  const { userInfo, token } = useSelector((state) => state.user);

  useEffect(() => {
    if (suggestions.length === 0 && token && userInfo) {
      dispatch(getFollowSuggestions());
    }
  }, [dispatch, suggestions.length, token, userInfo]);

  // Rest of your component stays exactly the same...
  const LoadingSkeleton = ({ count = 3 }) => (
    <div className="space-y-3 p-4">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="flex items-center space-x-3 animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-16 h-8 bg-gray-200 rounded flex-shrink-0"></div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-8 px-4">
      <div className="text-gray-400 text-sm mb-2">No suggestions available</div>
      <div className="text-gray-500 text-xs">Check back later for new people to follow</div>
    </div>
  );

  if (!token || !userInfo) {
    return (
      <div className={`bg-white rounded-lg border ${className}`}>
        {showTitle && (
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="text-center py-8 px-4">
          <div className="text-gray-400 text-sm mb-2">Please log in to see suggestions</div>
          <div className="text-gray-500 text-xs">Log in to discover new people to follow</div>
        </div>
      </div>
    );
  }

  if (loading && suggestions.length === 0) {
    return (
      <div className={`bg-white rounded-lg border ${className}`}>
        {showTitle && (
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        <LoadingSkeleton count={limit} />
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className={`bg-white rounded-lg border ${className}`}>
        {showTitle && (
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        <EmptyState />
      </div>
    );
  }

  const displaySuggestions = suggestions.slice(0, limit);
  const hasMore = suggestions.length > limit;

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {showTitle && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">{title}</h2>
            {hasMore && variant !== "sidebar" && (
              <button className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors">
                See All
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="divide-y divide-gray-100">
        {displaySuggestions.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            variant="suggestion"
            showFollowButton={true}
            onClick={() => {
              // Navigate to user profile
            }}
          />
        ))}
      </div>
      
      {hasMore && variant === "sidebar" && (
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => dispatch(getFollowSuggestions())}
            className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Show More ({suggestions.length - limit} more)
          </button>
        </div>
      )}
    </div>
  );
};

export default SuggestionsList;
