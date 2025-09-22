import React from 'react';

const ProfileTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-t border-gray-300">
      <button
        onClick={() => onTabChange('posts')}
        className={`flex-1 flex items-center justify-center py-3 text-xs font-semibold tracking-wider ${
          activeTab === 'posts'
            ? 'text-gray-900 border-t border-gray-900'
            : 'text-gray-400 hover:text-gray-700'
        }`}
      >
        <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z"/>
        </svg>
        POSTS
      </button>
      
      <button
        onClick={() => onTabChange('tagged')}
        className={`flex-1 flex items-center justify-center py-3 text-xs font-semibold tracking-wider ${
          activeTab === 'tagged'
            ? 'text-gray-900 border-t border-gray-900'
            : 'text-gray-400 hover:text-gray-700'
        }`}
      >
        <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        TAGGED
      </button>
    </div>
  );
};

export default ProfileTabs;
