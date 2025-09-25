import React from "react";
import { NavLink } from "react-router-dom";
import { IoPaperPlaneOutline } from 'react-icons/io5';

const Tab = ({ to, children, label, isSidebar = false }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      isSidebar
        ? `flex items-center px-3 py-3 rounded-lg transition-colors duration-200 mb-2 w-full ${
            isActive 
              ? "text-blue-600 bg-blue-50 font-semibold" 
              : "text-gray-700 hover:bg-gray-100"
          }`
        : `flex flex-col items-center justify-center px-3 py-2 ${
            isActive ? "text-blue-600" : "text-gray-700"
          }`
    }
  >
    <div className={isSidebar ? "mr-4" : ""}>
      {children}
    </div>
    {isSidebar ? (
      <span className="text-base">{label}</span>
    ) : (
      <span className="text-xs mt-1">{label}</span>
    )}
  </NavLink>
);

const BottomNav = () => {
  const navigationItems = [
    {
      to: "/feed",
      label: "Home",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      to: "/search",
      label: "Search",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      to: "/create",
      label: "Post",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    //  {
    //   to: "/chat", 
    //   label: "Messages",
    //   icon: <IoPaperPlaneOutline className="w-6 h-6" />
    // },
    {
      to: "/reels",
      label: "Reels",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m0-4v4m0-4L9 7m6 3L9 17" />
        </svg>
      )
    },
    {
      to: "/profile",
      label: "Profile",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex-col p-4 z-30 shadow-lg">
        {/* Logo */}
        <div className="mb-8 px-3 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Instagram</h1>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1">
          {navigationItems.map((item) => (
            <Tab 
              key={item.to} 
              to={item.to} 
              label={item.label} 
              isSidebar={true}
            >
              {item.icon}
            </Tab>
          ))}
        </nav>
      </div>

      {/* Mobile Bottom Navigation - Hidden on desktop */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-1 z-20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 flex justify-around">
          {navigationItems.map((item) => (
            <Tab 
              key={item.to} 
              to={item.to} 
              label={item.label}
            >
              {item.icon}
            </Tab>
          ))}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
