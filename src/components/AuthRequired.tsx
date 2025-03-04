import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getCurrentUser } from '@/services/authService';
import { supabase } from '@/lib/supabase';

interface AuthRequiredProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthRequired({ children, allowedRoles }: AuthRequiredProps) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { user: currentUser, error } = await getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        
        // If we need to check roles
        if (allowedRoles && allowedRoles.length > 0) {
          // Fetch the user profile to get the role
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();
          
          setHasRequiredRole(data && allowedRoles.includes(data.role));
        } else {
          setHasRequiredRole(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setHasRequiredRole(false);
      }
    };
    
    checkAuth();
  }, [allowedRoles]);

  // Still loading
  if (isAuthenticated === null || hasRequiredRole === null) {
    return <div>Loading...</div>;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to={`/auth?redirectTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Authenticated but doesn't have required role
  if (allowedRoles && allowedRoles.length > 0 && !hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  // Authenticated and has required role (or no role required)
  return <>{children || <Outlet />}</>;
}
