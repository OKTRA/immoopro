
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { signIn, signUp, resetPassword } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthProps {
  isRegister?: boolean;
}

const Auth: React.FC<AuthProps> = ({ isRegister = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'public' | 'agency' | 'owner'>('public');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      setUser(session?.user || null);
      if (session?.user && redirectTo) {
        navigate(redirectTo);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, redirectTo]);

  useEffect(() => {
    // Check if the URL is a redirect from /login to /auth
    if (location.pathname === '/auth' && !queryParams.has('redirectTo') && location.state?.from === '/login') {
      const loginParams = new URLSearchParams(location.state.search);
      const loginRedirectTo = loginParams.get('redirectTo');
      if (loginRedirectTo) {
        navigate(`/auth?redirectTo=${loginRedirectTo}`, { replace: true });
      }
    }
  }, [location, navigate, queryParams]);

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

  const validateForm = () => {
    setError(null);
    
    if (!email) {
      setError("L'email est requis");
      return false;
    }
    
    if (mode !== 'reset' && !password) {
      setError("Le mot de passe est requis");
      return false;
    }
    
    if (mode === 'register') {
      if (!firstName || !lastName) {
        setError("Le prénom et le nom sont requis");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        console.log('Attempting login with:', email);
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError);
          toast.error("Échec de connexion", { 
            description: signInError 
          });
          setIsLoading(false);
          return;
        }
        toast.success('Connexion réussie');
        // The redirect will be handled by the auth state change listener
      } else if (mode === 'register') {
        const { error: signUpError } = await signUp(email, password, { firstName, lastName, role });
        if (signUpError) {
          setError(signUpError);
          toast.error("Échec d'inscription", { 
            description: signUpError 
          });
          setIsLoading(false);
          return;
        }
        toast.success('Inscription réussie', { 
          description: 'Vérifiez votre email pour confirmer votre compte' 
        });
        setMode('login');
      } else if (mode === 'reset') {
        const { error: resetError } = await resetPassword(email);
        if (resetError) {
          setError(resetError);
          toast.error("Échec de réinitialisation", { 
            description: resetError 
          });
          setIsLoading(false);
          return;
        }
        toast.success('Email envoyé', { 
          description: 'Vérifiez votre email pour réinitialiser votre mot de passe' 
        });
        setMode('login');
      }
    } catch (error: any) {
      setError(error.message || 'Une erreur s\'est produite');
      toast.error("Erreur", { 
        description: error.message || 'Une erreur s\'est produite' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {mode === 'login' ? 'Connexion' : mode === 'register' ? 'Inscription' : 'Réinitialiser mot de passe'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' 
              ? 'Accédez à votre espace personnel'
              : mode === 'register' 
                ? 'Créez votre compte pour accéder à nos services'
                : 'Nous vous enverrons un email pour réinitialiser votre mot de passe'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/15 p-3 rounded-md flex items-start space-x-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Type de compte</Label>
                  <RadioGroup 
                    value={role} 
                    onValueChange={(value) => setRole(value as 'public' | 'agency' | 'owner')}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public">Utilisateur Standard</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="agency" id="agency" />
                      <Label htmlFor="agency">Espace Agence</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="owner" id="owner" />
                      <Label htmlFor="owner">Espace Propriétaire</Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            {mode !== 'reset' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  {mode === 'login' && (
                    <button 
                      type="button" 
                      className="text-sm text-primary hover:underline"
                      onClick={() => setMode('reset')}
                    >
                      Mot de passe oublié?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : mode === 'login' 
                ? 'Se connecter' 
                : mode === 'register' 
                  ? 'S\'inscrire' 
                  : 'Envoyer le lien'}
            </Button>
            <div className="text-center text-sm">
              {mode === 'login' ? (
                <p>
                  Pas encore de compte?{' '}
                  <button 
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setMode('register')}
                  >
                    S'inscrire
                  </button>
                </p>
              ) : (
                <p>
                  Déjà un compte?{' '}
                  <button 
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setMode('login')}
                  >
                    Se connecter
                  </button>
                </p>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
