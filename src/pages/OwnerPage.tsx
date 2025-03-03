
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function OwnerPage() {
  const navigate = useNavigate();
  const { user, isLoading, userRole } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login?redirectTo=/owner');
      return;
    }
    
    // Redirect if user is not an owner
    if (!isLoading && user && userRole !== 'owner') {
      toast.error("Accès refusé", {
        description: "Vous n'avez pas les droits d'accès à l'espace propriétaire"
      });
      navigate('/');
    }
  }, [user, isLoading, userRole, navigate]);

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
        <h1 className="text-3xl font-bold mb-8">Espace Propriétaire</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader>
              <CardTitle>Mes Propriétés</CardTitle>
              <CardDescription>Gérez vos biens immobiliers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Consultez et gérez l'ensemble de vos propriétés.</p>
              <Button>Voir mes propriétés</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Mes Locataires</CardTitle>
              <CardDescription>Suivez vos contrats de location</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Gérez les informations relatives à vos locataires.</p>
              <Button>Voir mes locataires</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Mes Revenus</CardTitle>
              <CardDescription>Suivez vos revenus locatifs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Consultez l'historique de vos paiements et revenus.</p>
              <Button>Voir mes revenus</Button>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-10">
          <CardHeader>
            <CardTitle>Tableau de bord</CardTitle>
            <CardDescription>Aperçu de vos activités</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Fonctionnalité en cours de développement</p>
              <p>Le tableau de bord sera bientôt disponible</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
