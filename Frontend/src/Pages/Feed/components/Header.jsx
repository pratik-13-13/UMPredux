import React, { useEffect } from "react";
import { IoPaperPlaneOutline, IoHeartOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getFollowRequests } from "../../../Store/Slices/followSlice.js";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { followRequests } = useSelector(state => state.follow);
  
  useEffect(() => {
    // ✅ ONLY fetch once on component mount - NO MORE POLLING!
    dispatch(getFollowRequests());
  }, [dispatch]);

  const requestCount = followRequests?.length || 0;

  const handleNotificationClick = () => {
    navigate('/follow-requests');
  };

  
  //Handle messages click
  const handleMessagesClick = () => {
    navigate('/chat');
  };

  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
          Instagram
        </h1>
        <div className="flex items-center space-x-4">
          {/* Heart Icon with Real-time Notification Badge */}
          <button 
            onClick={handleNotificationClick}
            className="relative p-1"
          >
            <IoHeartOutline size={24} className="text-gray-800" />
            {requestCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-xs font-bold">
                  {requestCount > 9 ? '9+' : requestCount}
                </span>
              </div>
            )}
          </button>
          
          <button 
           onClick={handleMessagesClick}
            className="relative p-1"
            >
            
            <IoPaperPlaneOutline size={24} className="text-gray-800" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
