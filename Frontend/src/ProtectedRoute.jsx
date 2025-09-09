import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("authToken");
  const storedUserInfo = localStorage.getItem("userInfo");
  const role = storedUserInfo ? JSON.parse(storedUserInfo)?.role : null;

  const isTokenExpired = (jwtToken) => {
    if (!jwtToken) return true;
    try {
      const base64Url = jwtToken.split(".")[1];
      if (!base64Url) return true;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64));
      if (!payload?.exp) return false;
      return payload.exp * 1000 <= Date.now();
    } catch (e) {
      return true;
    }
  };

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // redirect to profile if role doesn't match
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
