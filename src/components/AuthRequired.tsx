
import React, { ReactNode, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

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
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        const currentUser = data.session?.user;
        
        if (currentUser) {
          setUser(currentUser);
          
          if (requiredRole) {
            // Fetch user profile to get role
            const { data: profileData } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', currentUser.id)
              .single();
              
            setUserRole(profileData?.role || null);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        if (requiredRole) {
          // Fetch user profile to get role
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          setUserRole(profileData?.role || null);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [requiredRole]);
  
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
