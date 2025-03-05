
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { signIn } from '@/services/authService';
import { toast } from 'sonner';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchMode: (mode: 'register' | 'reset') => void;
  disableRegistration?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  onSwitchMode,
  disableRegistration = false
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    setError(null);
    
    if (!email) {
      setError("L'email est requis");
      return false;
    }
    
    if (!password) {
      setError("Le mot de passe est requis");
      return false;
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
      console.log('Attempting login with:', email);
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError);
        toast.error("Échec de connexion", { 
          description: signInError === "Invalid login credentials" 
            ? "Email ou mot de passe incorrect" 
            : signInError 
        });
        setIsLoading(false);
        return;
      }
      
      toast.success('Connexion réussie');
      onSuccess();
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
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {error && (
          <div className="bg-destructive/15 p-3 rounded-md flex items-start space-x-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
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
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <button 
              type="button" 
              className="text-sm text-primary hover:underline"
              onClick={() => onSwitchMode('reset')}
            >
              Mot de passe oublié?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
      </div>
      
      <div className="mt-4 space-y-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : 'Se connecter'}
        </Button>
        
        {!disableRegistration && (
          <div className="text-center text-sm">
            <p>
              Pas encore de compte?{' '}
              <button 
                type="button"
                className="text-primary hover:underline"
                onClick={() => onSwitchMode('register')}
              >
                S'inscrire
              </button>
            </p>
          </div>
        )}
      </div>
    </form>
  );
};

export default LoginForm;
