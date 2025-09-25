import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackOutline, IoSearchOutline } from 'react-icons/io5';
import { getUserChats } from '../../Store/Slices/chatSlice.js';
import ChatListItem from '../../components/Chat/ChatListItem.jsx';
import UserSearchModal from '../../components/Chat/UserSearchModal.jsx'; 

const ChatList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chats, loading } = useSelector(state => state.chat);
  const [showSearchModal, setShowSearchModal] = useState(false); // NEW

  useEffect(() => {
    dispatch(getUserChats());
  }, [dispatch]);

  const handleBackClick = () => {
    navigate('/feed');
  };

  //  Open search modal instead of navigating
  const handleSearchClick = () => {
    setShowSearchModal(true);
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header - Instagram Style */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IoArrowBackOutline size={24} className="text-gray-800" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
            </div>
            
            {/*  search icon */}
            <div className="flex items-center">
              <button
                onClick={handleSearchClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IoSearchOutline size={24} className="text-gray-800" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat List - Always Show */}
        <div className="pb-20">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : chats.length === 0 ? (
            /*  Instagram-style empty state */
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-24 h-24 border-2 border-gray-300 rounded-full flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Messages</h3>
              <p className="text-gray-500 text-center mb-6">
                Send private photos and messages to a friend or group.
              </p>
              {/*  Search to start chatting */}
              <button
                onClick={handleSearchClick}
                className="text-blue-500 font-medium hover:text-blue-600 transition-colors"
              >
                Search people to start chatting
              </button>
            </div>
          ) : (
            /*  Show chat list */
            <div className="divide-y divide-gray-100">
              {chats.map((chat) => (
                <ChatListItem
                  key={chat._id}
                  chat={chat}
                  onClick={() => navigate(`/chat/${chat._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Search Modal */}
      {showSearchModal && (
        <UserSearchModal 
          onClose={() => setShowSearchModal(false)}
          onUserSelect={(userId) => {
            // Handle user selection and navigate to chat
            setShowSearchModal(false);
            // This will be handled in the modal component
          }}
        />
      )}
    </>
  );
};

export default ChatList;
