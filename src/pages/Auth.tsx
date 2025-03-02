
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { signInWithEmail, signUpWithEmail } from '@/services/authService';
import { toast } from 'sonner';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, Building, UserCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type FormData = {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'agency' | 'owner' | 'public';
};

interface AuthProps {
  isRegister?: boolean;
}

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

const signupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  role: z.enum(['admin', 'agency', 'owner', 'public']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export default function Auth({ isRegister = false }: AuthProps) {
  const [activeTab, setActiveTab] = useState<string>(isRegister ? 'signup' : 'login');
  const [loading, setLoading] = useState(false);
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm<FormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'public',
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" />;
  }

  const handleLogin = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await signInWithEmail(data.email, data.password);
      
      if (result.error) {
        toast(`Échec de la connexion: ${result.error}`);
      } else {
        toast('Connexion réussie');
        navigate('/');
      }
    } catch (error: any) {
      toast(`Erreur de connexion: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await signUpWithEmail(
        data.email, 
        data.password, 
        {
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        }
      );
      
      if (result.error) {
        toast(`Échec de l'inscription: ${result.error}`);
      } else {
        toast('Inscription réussie! Veuillez vérifier votre email.');
        // Switch to login tab after successful registration
        setActiveTab('login');
      }
    } catch (error: any) {
      toast(`Erreur d'inscription: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/30">
      <AnimatedCard className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold mb-2">Bienvenue</h2>
          <p className="text-muted-foreground">Connectez-vous ou créez un compte pour continuer</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    className="pl-10"
                    {...loginRegister('email')}
                  />
                </div>
                {loginErrors.email && <p className="text-sm text-destructive">{loginErrors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...loginRegister('password')}
                  />
                </div>
                {loginErrors.password && <p className="text-sm text-destructive">{loginErrors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignupSubmit(handleSignUp)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-firstName">Prénom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-firstName"
                      placeholder="Jean"
                      className="pl-10"
                      {...signupRegister('firstName')}
                    />
                  </div>
                  {signupErrors.firstName && <p className="text-sm text-destructive">{signupErrors.firstName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-lastName">Nom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-lastName"
                      placeholder="Dupont"
                      className="pl-10"
                      {...signupRegister('lastName')}
                    />
                  </div>
                  {signupErrors.lastName && <p className="text-sm text-destructive">{signupErrors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="votre@email.com"
                    className="pl-10"
                    {...signupRegister('email')}
                  />
                </div>
                {signupErrors.email && <p className="text-sm text-destructive">{signupErrors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...signupRegister('password')}
                  />
                </div>
                {signupErrors.password && <p className="text-sm text-destructive">{signupErrors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...signupRegister('confirmPassword')}
                  />
                </div>
                {signupErrors.confirmPassword && <p className="text-sm text-destructive">{signupErrors.confirmPassword.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Type d'utilisateur</Label>
                <RadioGroup defaultValue="public" className="grid grid-cols-2 gap-2" {...signupRegister('role')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="flex items-center cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Client
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="owner" id="owner" />
                    <Label htmlFor="owner" className="flex items-center cursor-pointer">
                      <Building className="mr-2 h-4 w-4" />
                      Propriétaire
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="agency" id="agency" />
                    <Label htmlFor="agency" className="flex items-center cursor-pointer">
                      <Building className="mr-2 h-4 w-4" />
                      Agence
                    </Label>
                  </div>
                </RadioGroup>
                {signupErrors.role && <p className="text-sm text-destructive">{signupErrors.role.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Inscription en cours...' : "S'inscrire"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </AnimatedCard>
    </div>
  );
}
