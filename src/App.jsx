import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Login from './components/Login/Login.jsx';
import Register from './components/Register/Register.jsx';
import Home from './components/Home/Home.jsx';
import EditUser from './components/Edit/Edit.jsx';
import AddUser from './components/AddUser/AddUser';
//import AddUser  from './components/AddUser/AddUser.jsx'
 
function App() {

  const ramRouter = createBrowserRouter([
    {
      path: "/",
      element: <Home />
    },
    {
      path: "/register",
      element: <Register />
    },
    {
      path: "/login",
      element: <Login />
    },
    {path: "/edit/:id",
      element: <EditUser />
    },
    {
      path: "/addUser",
      element: <AddUser />
    }
  ])

  return (
    <>
      < RouterProvider router={ramRouter} />
    </>
  )
}

export default App
