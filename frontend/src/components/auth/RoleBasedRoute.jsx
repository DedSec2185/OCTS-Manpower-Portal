import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export function RoleBasedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role?.toLowerCase();
  const normalizedAllowed = allowedRoles.map(role => role.toLowerCase());

  if (!normalizedAllowed.includes(userRole)) {
    // Redirect to appropriate dashboard
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'clerk') return <Navigate to="/clerk" replace />;
    return <Navigate to="/user" replace />;
  }

  return children;
}
