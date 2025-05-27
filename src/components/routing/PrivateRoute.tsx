// src/components/routing/PrivateRoute.tsx
// Enhanced PrivateRoute with support for multiple roles

import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role) {
    // Handle multiple roles (comma-separated)
    const allowedRoles = requiredRole.split(',').map(role => role.trim());
    
    if (!allowedRoles.includes(user.role)) {
      // If user doesn't have required role, redirect to their appropriate dashboard
      switch (user.role) {
        case 'admin':
          return <Navigate to="/dashboard/admin" replace />;
        case 'manager':
          return <Navigate to="/dashboard/manage" replace />;
        case 'pickup_boy':
          return <Navigate to="/dashboard" replace />;
        default:
          return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;