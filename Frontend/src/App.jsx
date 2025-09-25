import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux'; // ADD: Redux Provider
import { Toaster } from 'react-hot-toast'; // ADD: Toast notifications
import store from './Store/Store.js'; // ADD: Your Redux store
import './Styles/App.css';
import Login from './Pages/Auth/Login/Login.jsx';
import Register from './Pages/Auth/Register/Register.jsx';
import Home from './Pages/Home/Home.jsx';
import EditUser from './components/Forms/Edit/Edit.jsx';
import AddUser from './Pages/AddUser/AddUser.jsx';
import Profile from './Pages/Profile/Profile.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Feed from './Pages/Feed/Feed.jsx';
import CreatePost from './components/Forms/CreatePost/CreatePost.jsx';
import CreateStory from './Pages/Story/CreateStory/CreateStory.jsx';
import StoryViewer from './Pages/Story/StoryViewer/StoryViewer.jsx';
import BottomNav from './components/Layout/BottomNav/BottomNav.jsx';
import FollowRequests from './Pages/FollowRequests/FollowRequests.jsx';
import FollowersPage from "./Pages/Followers/FollowersPage.jsx";
import FollowingPage from './Pages/Following/FollowingPage.jsx';
import useSocket from './Hooks/useSocket.js';
import './components/UI/Notifications/NotificationStyles.css';
import ChatList from './Pages/Chat/ChatList.jsx';
import ChatWindow from './Pages/Chat/ChatWindow.jsx';
import NewChat from './Pages/Chat/NewChat.jsx';

// Layout component that includes navigation
const Layout = () => {
  useSocket(); // KEEP: Initialize WebSocket

  return (
    <>
      <BottomNav />
      <div className="pb-16 md:pb-0 md:ml-64 min-h-screen bg-gray-50 transition-all duration-300">
        <Outlet />
      </div>
    </>
  );
};

// Layout component without navigation (for auth pages)
const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
};

// WRAP: Router logic in separate component for Redux Provider
function AppContent() {
  const ramRouter = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute requiredRole="admin">
              <Home />
            </ProtectedRoute>
          ),
        },
        {
          path: "feed",
          element: (
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          ),
        },
        {
          path: "create",
          element: (
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          ),
        },
        {
          path: "create-story",
          element: (
            <ProtectedRoute>
              <CreateStory />
            </ProtectedRoute>
          ),
        },
        {
          path: "story/:userId",
          element: (
            <ProtectedRoute>
              <StoryViewer />
            </ProtectedRoute>
          ),
        },
        {
          path: "addUser",
          element: (
            <ProtectedRoute requiredRole="admin">
              <AddUser />
            </ProtectedRoute>
          ),
        },
        {
          path: "edit/:id",
          element: (
            <ProtectedRoute requiredRole="admin">
              <EditUser />
            </ProtectedRoute>
          ),
        },
        {
          path: "profile",
          element: (
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          ),
        },
        {
          path: "search",
          element: (
            <ProtectedRoute>
              <div className="p-4">
                <h1 className="text-2xl font-bold">Search Page</h1>
                <p>Search functionality coming soon...</p>
              </div>
            </ProtectedRoute>
          ),
        },
        {
          path: "reels",
          element: (
            <ProtectedRoute>
              <div className="p-4">
                <h1 className="text-2xl font-bold">Reels Page</h1>
                <p>Reels functionality coming soon...</p>
              </div>
            </ProtectedRoute>
          ),
        },
        {
          path: "follow-requests",
          element: (
            <ProtectedRoute>
              <FollowRequests />
            </ProtectedRoute>
          ),
        },
        {
          path: "followers/:userId",
          element: (
            <ProtectedRoute>
              <FollowersPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "following/:userId",
          element: (
            <ProtectedRoute>
              <FollowingPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "chat",
          element: (
            <ProtectedRoute>
              <ChatList />
            </ProtectedRoute>
          ),
        },
        {
          path: "chat/new",
          element: (
            <ProtectedRoute>
              <NewChat />
            </ProtectedRoute>
          ),
        },
        {
          path: "chat/:chatId",
          element: (
            <ProtectedRoute>
              <ChatWindow />
            </ProtectedRoute>
          ),
        },
      ]
    },
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [
        {
          path: "login",
          element: <Login />
        },
        {
          path: "register",
          element: <Register />
        }
      ]
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/register",
      element: <Register />
    }
  ]);

  return <RouterProvider router={ramRouter} />;
}

// MAIN: App component with Redux Provider and Toaster
function App() {
  return (
    <Provider store={store}>
      <AppContent />

      {/* ADD: Toaster for WebSocket notifications */}
      <Toaster
        position="top-right"
        containerClassName="z-50"
        toastOptions={{
          className: 'bg-white shadow-lg border border-gray-200 text-gray-900 rounded-lg',
          duration: 4000,
          style: {
            maxWidth: '400px',
          },
        }}
      />
    </Provider>
  );
}

export default App;
