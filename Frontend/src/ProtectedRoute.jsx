import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("authToken");
  const storedUserInfo = localStorage.getItem("userInfo");
  const role = storedUserInfo ? JSON.parse(storedUserInfo)?.role : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // redirect to profile if role doesn't match
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
