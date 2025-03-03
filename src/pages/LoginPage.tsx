
import React from 'react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn, signUp } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Get redirectTo from query params or default to '/'
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirectTo') || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user, error } = await signIn(formData.email, formData.password);
      
      if (error) {
        toast.error("Erreur de connexion", {
          description: error,
        });
        return;
      }
      
      if (user) {
        toast.success("Connexion réussie", {
          description: "Vous êtes maintenant connecté",
        });
        navigate(redirectTo);
      }
    } catch (error: any) {
      toast.error("Erreur de connexion", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user, error } = await signUp(
        formData.email, 
        formData.password,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: 'public'
        }
      );
      
      if (error) {
        toast.error("Erreur d'inscription", {
          description: error,
        });
        return;
      }
      
      if (user) {
        toast.success("Inscription réussie", {
          description: "Vous êtes maintenant inscrit et connecté",
        });
        navigate(redirectTo);
      }
    } catch (error: any) {
      toast.error("Erreur d'inscription", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container max-w-md mx-auto py-16 px-4">
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Créer un compte</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Connexion</CardTitle>
                  <CardDescription>
                    Connectez-vous à votre compte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="exemple@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
                      <button 
                        type="button" 
                        className="text-sm text-primary hover:underline"
                        onClick={() => toast.info("Fonctionnalité à venir", { description: "La réinitialisation de mot de passe sera bientôt disponible" })}
                      >
                        Mot de passe oublié?
                      </button>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Connexion en cours..." : "Se connecter"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardHeader>
                  <CardTitle>Créer un compte</CardTitle>
                  <CardDescription>
                    Inscrivez-vous pour accéder à nos services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium">Prénom</label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Jean"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium">Nom</label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Dupont"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email-signup" className="text-sm font-medium">Email</label>
                    <Input
                      id="email-signup"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="exemple@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password-signup" className="text-sm font-medium">Mot de passe</label>
                    <Input
                      id="password-signup"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Création en cours..." : "Créer un compte"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      <Footer />
    </>
  );
}
