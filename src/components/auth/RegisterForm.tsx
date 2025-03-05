
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, Loader2 } from 'lucide-react';
import { signUp } from '@/services/authService';
import { toast } from 'sonner';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchMode: (mode: 'login') => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'public' | 'agency' | 'owner'>('public');
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
    
    if (!firstName || !lastName) {
      setError("Le prénom et le nom sont requis");
      return false;
    }
    
    // Password strength validation
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
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
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
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
          ) : 'S\'inscrire'}
        </Button>
        
        <div className="text-center text-sm">
          <p>
            Déjà un compte?{' '}
            <button 
              type="button"
              className="text-primary hover:underline"
              onClick={() => onSwitchMode('login')}
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </form>
  );
};

export default RegisterForm;
