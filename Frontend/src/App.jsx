import React from 'react';
import { createBrowserRouter, RouterProvider,  } from 'react-router-dom';
import './App.css';
import Login from './components/Login/Login.jsx';
import Register from './components/Register/Register.jsx';
import Home from './components/Home/Home.jsx';
import EditUser from './components/Edit/Edit.jsx';
import AddUser from './components/AddUser/AddUser.jsx';
import Profile from './components/Profile/Profile.jsx'; 
import ProtectedRoute from './ProtectedRoute.jsx';
import Feed from './components/Feed/Feed.jsx';
import CreatePost from './components/CreatePost/CreatePost.jsx';

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
