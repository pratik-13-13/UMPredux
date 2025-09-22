import React from 'react';
import FollowButton from './FollowButton';

const UserCard = ({ 
  user, 
  showFollowButton = true, 
  variant = 'default',
  onClick,
  className = ''
}) => {
  // Generate avatar with initials and colors
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

  const avatar = generateAvatar(user);

  // Card variant classes
  const getCardClasses = () => {
    const baseClasses = "flex items-center";
    
    switch (variant) {
      case 'suggestion':
        return `${baseClasses} justify-between p-3 hover:bg-gray-50 transition-colors cursor-pointer`;
      case 'modal':
        return `${baseClasses} justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors`;
      case 'compact':
        return `${baseClasses} space-x-2 p-2`;
      default:
        return `${baseClasses} space-x-3 p-3`;
    }
  };

  // Avatar size based on variant
  const getAvatarSize = () => {
    switch (variant) {
      case 'compact':
        return 'w-8 h-8';
      case 'modal':
        return 'w-14 h-14';
      default:
        return 'w-12 h-12';
    }
  };

  // Text size based on variant
  const getTextSizes = () => {
    switch (variant) {
      case 'compact':
        return {
          name: 'text-xs',
          stats: 'text-xs',
          bio: 'text-xs'
        };
      case 'modal':
        return {
          name: 'text-base',
          stats: 'text-sm',
          bio: 'text-sm'
        };
      default:
        return {
          name: 'text-sm',
          stats: 'text-xs',
          bio: 'text-xs'
        };
    }
  };

  const textSizes = getTextSizes();

  return (
    <div className={`${getCardClasses()} ${className}`}>
      <div 
        className="flex items-center space-x-3 flex-1 cursor-pointer"
        onClick={onClick}
      >
        {/* User Avatar */}
        <div className={`${getAvatarSize()} bg-gradient-to-r ${avatar.color} rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-semibold text-sm">
            {avatar.initials}
          </span>
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            <h3 className={`font-semibold ${textSizes.name} text-gray-900 truncate`}>
              {user.name}
            </h3>
            {user.isVerified && (
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          {/* User Stats and Bio */}
          {variant !== 'compact' && (
            <div className="mt-1">
              <div className={`flex items-center space-x-3 ${textSizes.stats} text-gray-500`}>
                <span>{user.followerCount || 0} followers</span>
                {user.followingCount !== undefined && (
                  <span>{user.followingCount} following</span>
                )}
              </div>
              {user.bio && variant === 'modal' && (
                <p className={`${textSizes.bio} text-gray-600 mt-1 truncate max-w-64`}>
                  {user.bio}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Follow Button */}
      {showFollowButton && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0"
        >
          <FollowButton 
            userId={user._id} 
            variant="small"
            showUnfollowModal={true}
          />
        </div>
      )}
    </div>
  );
};

export default UserCard;
