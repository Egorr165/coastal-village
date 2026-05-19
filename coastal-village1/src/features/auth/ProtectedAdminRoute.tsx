import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user || !user.is_staff) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
