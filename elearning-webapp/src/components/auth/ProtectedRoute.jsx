import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { canAccessAdminPanel } from '../../utils/roles';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return canAccessAdminPanel(user.role)
      ? <Navigate to="/admin/dashboard" replace />
      : <Navigate to="/user/home" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
