import React from 'react';

const ProfileStats = ({ postsCount, followersCount, followingCount }) => {
  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  return (
    <div className="flex justify-around py-4 px-4 border-t border-gray-200">
      <div className="text-center">
        <div className="font-semibold text-lg">{formatCount(postsCount)}</div>
        <div className="text-gray-600 text-sm">posts</div>
      </div>
      
      <button className="text-center hover:opacity-70 transition-opacity">
        <div className="font-semibold text-lg">{formatCount(followersCount)}</div>
        <div className="text-gray-600 text-sm">followers</div>
      </button>
      
      <button className="text-center hover:opacity-70 transition-opacity">
        <div className="font-semibold text-lg">{formatCount(followingCount)}</div>
        <div className="text-gray-600 text-sm">following</div>
      </button>
    </div>
  );
};

export default ProfileStats;
