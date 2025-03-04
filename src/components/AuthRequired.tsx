
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

export interface AuthRequiredProps {
  children: ReactNode;
  redirectTo?: string;
  requiredRole?: string;
}

const AuthRequired: React.FC<AuthRequiredProps> = ({ 
  children, 
  redirectTo = '/auth', 
  requiredRole 
}) => {
  const { user, userRole, isLoading } = useUser();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Not authenticated
  if (!user) {
    const searchParams = new URLSearchParams();
    searchParams.append('redirectTo', location.pathname);
    return <Navigate to={`${redirectTo}?${searchParams.toString()}`} replace />;
  }
  
  // Role check (if a specific role is required)
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default AuthRequired;
