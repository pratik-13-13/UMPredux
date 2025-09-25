import React from 'react';
import toast from 'react-hot-toast';

// Custom toast notification with Tailwind styling
export const showFollowRequestNotification = (userName) => {
  toast.custom((t) => (
    <div className={`
      ${t.visible ? 'animate-enter' : 'animate-leave'}
      max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto 
      flex ring-1 ring-black ring-opacity-5 transform transition-all duration-300
    `}>
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Follow Request
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {userName} sent you a follow request
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  ), {
    duration: 5000,
    position: 'top-right',
  });
};

export const showFollowAcceptedNotification = (userName) => {
  toast.success(
    <div className="flex items-center">
      <span className="mr-2">🎉</span>
      <span>{userName} accepted your follow request!</span>
    </div>,
    {
      duration: 4000,
      position: 'top-right',
      className: 'bg-green-50 text-green-800 border border-green-200',
    }
  );
};

export const showFollowRejectedNotification = (userName) => {
  toast.error(
    <div className="flex items-center">
      <span className="mr-2">😔</span>
      <span>{userName} declined your follow request</span>
    </div>,
    {
      duration: 4000,
      position: 'top-right',
      className: 'bg-red-50 text-red-800 border border-red-200',
    }
  );
};
