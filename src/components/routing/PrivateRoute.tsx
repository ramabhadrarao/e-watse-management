import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;