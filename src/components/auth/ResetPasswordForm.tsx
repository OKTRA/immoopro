
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { resetPassword } from '@/services/authService';
import { toast } from 'sonner';

interface ResetPasswordFormProps {
  onSuccess: () => void;
  onSwitchMode: (mode: 'login') => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSuccess, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    setError(null);
    
    if (!email) {
      setError("L'email est requis");
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
      </div>
      
      <div className="mt-4 space-y-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : 'Envoyer le lien'}
        </Button>
        
        <div className="text-center text-sm">
          <p>
            <button 
              type="button"
              className="text-primary hover:underline"
              onClick={() => onSwitchMode('login')}
            >
              Retour à la connexion
            </button>
          </p>
        </div>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
