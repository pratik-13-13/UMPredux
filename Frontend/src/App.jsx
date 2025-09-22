import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
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
import FollowRequests
  from './Pages/FollowRequests/FollowRequests.jsx';
import FollowersPage from "./Pages/Followers/FollowersPage.jsx"
import FollowingPage from './Pages/Following/FollowingPage.jsx';
// Layout component that includes navigation
const Layout = () => {
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

function App() {
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
        }



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

export default App;
