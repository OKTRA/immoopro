import { useEffect, useState } from 'react';
import { getCurrentUser, getUserProfile } from '@/services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building, Home, Users } from "lucide-react";

export function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          
          // Get user role from profile
          const { profile } = await getUserProfile(currentUser.id);
          setUserRole(profile?.role || null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bienvenue sur ImmoConnect</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à votre tableau de bord
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/auth")}>Se connecter</Button>
        </CardContent>
      </Card>
    );
  }

  // Redirect to appropriate dashboard based on user role
  const getDashboardCards = () => {
    if (userRole === "admin") {
      return (
        <>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Gestion des utilisateurs
              </CardTitle>
              <CardDescription>
                Administrez les comptes utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate("/admin/users")}
              >
                Gérer les utilisateurs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Gestion des agences
              </CardTitle>
              <CardDescription>
                Validez et gérez les agences immobilières
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate("/admin/agencies")}
              >
                Gérer les agences
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </>
      );
    } else if (userRole === "agency") {
      return (
        <>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Mon agence
              </CardTitle>
              <CardDescription>
                Gérez votre agence immobilière
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate("/agencies")}
              >
                Accéder à mon agence
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Propriétés
              </CardTitle>
              <CardDescription>
                Gérez vos biens immobiliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate("/agencies/properties")}
              >
                Voir mes propriétés
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </>
      );
    } else if (userRole === "owner") {
      return (
        <>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Mes propriétés
              </CardTitle>
              <CardDescription>
                Gérez vos biens immobiliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate("/owner/properties")}
              >
                Voir mes propriétés
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Mes locataires
              </CardTitle>
              <CardDescription>
                Gérez vos locataires et contrats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate("/owner/tenants")}
              >
                Voir mes locataires
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </>
      );
    } else {
      // Regular user
      return (
        <>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Rechercher un bien</CardTitle>
              <CardDescription>
                Trouvez votre prochain logement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate("/search")}
              >
                Rechercher
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Mon profil</CardTitle>
              <CardDescription>
                Gérez vos informations personnelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate("/profile")}
              >
                Voir mon profil
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </>
      );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {getDashboardCards()}
    </div>
  );
}
