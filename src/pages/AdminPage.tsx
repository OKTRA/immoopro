
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        const currentUser = data.session?.user;
        
        if (!currentUser) {
          navigate('/auth?redirectTo=/admin');
          return;
        }
        
        setUser(currentUser);
        
        // Check if user has admin role
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();
        
        if (profileData) {
          setUserRole(profileData.role);
          
          // Redirect if user is not an admin
          if (profileData.role !== 'admin') {
            toast.error("Accès refusé", {
              description: "Vous n'avez pas les droits d'accès à l'espace administrateur"
            });
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/auth?redirectTo=/admin');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-16 px-4 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Espace Administrateur</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>Administrez les comptes utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Gérez les comptes, les rôles et les permissions.</p>
              <Button>Gérer les utilisateurs</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Gestion des agences</CardTitle>
              <CardDescription>Administrez les agences immobilières</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Validez et gérez les agences sur la plateforme.</p>
              <Button>Gérer les agences</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Consultez les statistiques de la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Analysez l'activité et les métriques de la plateforme.</p>
              <Button>Voir les statistiques</Button>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-10">
          <CardHeader>
            <CardTitle>Paramètres système</CardTitle>
            <CardDescription>Configuration de la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Fonctionnalité en cours de développement</p>
              <p>Les paramètres système seront bientôt disponibles</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
