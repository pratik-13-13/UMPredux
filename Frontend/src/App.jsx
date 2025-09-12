import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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

function App() {
  const ramRouter = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute requiredRole="admin">
          <Home />
        </ProtectedRoute>
      ),
    },
    {
      path: "/feed",
      element: (
        <ProtectedRoute>
          <Feed />
        </ProtectedRoute>
      ),
    },
    {
      path: "/create",
      element: (
        <ProtectedRoute>
          <CreatePost />
        </ProtectedRoute>
      ),
    },
    {
      path: "/create-story",
      element: (
        <ProtectedRoute>
          <CreateStory />
        </ProtectedRoute>
      ),
    },
    {
      path: "/story/:userId", 
      element: (
        <ProtectedRoute>
          <StoryViewer />
        </ProtectedRoute>
      ),
    },
    {
      path: "/addUser",
      element: (
        <ProtectedRoute requiredRole="admin">
          <AddUser />
        </ProtectedRoute>
      ),
    },
    {
      path: "/edit/:id",
      element: (
        <ProtectedRoute requiredRole="admin">
          <EditUser />
        </ProtectedRoute>
      ),
    },
    {
      path: "/profile",
      element: (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      ),
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
