
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import AuthContainer from '@/components/auth/AuthContainer';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

interface AuthProps {
  isRegister?: boolean;
}

const Auth: React.FC<AuthProps> = ({ isRegister = false }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(isRegister ? 'register' : 'login');
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from query params if it exists
  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get('redirectTo') || '/';

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true);
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
    
    // Setup auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      setUser(session?.user || null);
      if (session?.user) {
        navigate(redirectTo);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, redirectTo]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if user is already logged in
  if (user) {
    console.log('User already logged in, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  const handleSuccess = () => {
    // Set mode to login after successful registration or password reset
    if (mode !== 'login') {
      setMode('login');
    }
    // For login success, the auth state change listener will handle navigation
  };

  // Determine the form to show based on mode
  const renderAuthForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm 
            onSuccess={handleSuccess} 
            onSwitchMode={setMode}
          />
        );
      case 'register':
        return (
          <RegisterForm 
            onSuccess={handleSuccess} 
            onSwitchMode={setMode}
          />
        );
      case 'reset':
        return (
          <ResetPasswordForm 
            onSuccess={handleSuccess} 
            onSwitchMode={setMode}
          />
        );
    }
  };

  // Get titles and descriptions based on current mode
  const getAuthContent = () => {
    switch (mode) {
      case 'login':
        return {
          title: 'Connexion',
          description: 'Accédez à votre espace personnel'
        };
      case 'register':
        return {
          title: 'Inscription',
          description: 'Créez votre compte pour accéder à nos services'
        };
      case 'reset':
        return {
          title: 'Réinitialiser mot de passe',
          description: 'Nous vous enverrons un email pour réinitialiser votre mot de passe'
        };
    }
  };

  const content = getAuthContent();

  return (
    <AuthContainer 
      title={content.title} 
      description={content.description}
    >
      {renderAuthForm()}
    </AuthContainer>
  );
};

export default Auth;
