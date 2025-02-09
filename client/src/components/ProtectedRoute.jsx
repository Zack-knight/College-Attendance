import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode"; 

const ProtectedRoute = ({ children, roles }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Decode the token using jwt-decode
  const decoded = jwtDecode(token);
  if (!decoded || (roles && !roles.includes(decoded.role))) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;