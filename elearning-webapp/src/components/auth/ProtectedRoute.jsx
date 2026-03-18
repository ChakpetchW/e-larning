import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If user is logged in but doesn't have the right role
    // Redirect admins to dashboard and users to home
    return user.role === 'admin' 
        ? <Navigate to="/admin/dashboard" replace /> 
        : <Navigate to="/user/home" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
