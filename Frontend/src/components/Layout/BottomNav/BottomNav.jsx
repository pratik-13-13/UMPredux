import React from "react";
import { NavLink } from "react-router-dom";

const Tab = ({ to, children, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center px-3 py-2 ${isActive ? "text-blue-600" : "text-gray-700"}`
    }
  >
    {children}
    <span className="text-xs mt-1">{label}</span>
  </NavLink>
);

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0   left-0 right-0 bg-gray-400 border-t border-gray-200 py-1 z-20">
      <div className="max-w-4xl mx-auto px-4 flex justify-around">
        <Tab to="/feed" label="Home">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Tab>

        <Tab to="/search" label="Search">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Tab>

        <Tab to="/create" label="Post">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Tab>

        <Tab to="/reels" label="Reels">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m0-4v4m0-4L9 7m6 3L9 17" />
          </svg>
        </Tab>

        <Tab to="/profile" label="Profile">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Tab>
      </div>
    </nav>
  );
};

export default BottomNav;


