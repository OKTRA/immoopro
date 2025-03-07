
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import AuthContainer from '@/components/auth/AuthContainer';
import LoginForm from '@/components/auth/LoginForm';
import { toast } from 'sonner';
import { isUserAdmin } from '@/services/adminRoleService';

const AdminAuth: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true);
        const { data } = await supabase.auth.getSession();
        const currentUser = data.session?.user;
        setUser(currentUser || null);
        
        // If user is logged in, check if they are an admin
        if (currentUser) {
          const { isAdmin: adminStatus, adminRole } = await isUserAdmin(currentUser.id);
          setIsAdmin(adminStatus);
          
          if (adminStatus) {
            console.log(`User is authenticated as admin with role: ${adminRole}`);
            navigate('/admin');
          } else {
            toast.error("Accès restreint", { 
              description: "Vous n'avez pas les droits d'administrateur nécessaires."
            });
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
    
    // Setup auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Admin auth state changed:', event);
      const currentUser = session?.user;
      setUser(currentUser || null);
      
      if (currentUser) {
        // Check if the user is an admin
        const { isAdmin: adminStatus } = await isUserAdmin(currentUser.id);
        setIsAdmin(adminStatus);
        
        if (adminStatus) {
          navigate('/admin');
        } else {
          toast.error("Accès restreint", { 
            description: "Vous n'avez pas les droits d'administrateur nécessaires."
          });
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if user is already logged in and is an admin
  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleLoginSuccess = () => {
    // The auth state change listener will handle navigation after checking admin status
  };

  return (
    <AuthContainer 
      title="Administration" 
      description="Connectez-vous à l'espace d'administration"
    >
      <LoginForm 
        onSuccess={handleLoginSuccess} 
        onSwitchMode={() => {}}
        disableRegistration={true}
      />
    </AuthContainer>
  );
};

export default AdminAuth;
