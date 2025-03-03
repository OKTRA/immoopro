
import { useQuery } from "@tanstack/react-query";
import { getAllAgencies } from "@/services/agencyService";
import AgencyCard from "@/components/AgencyCard";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { Building, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { useEffect, useState } from "react";
import { isSupabaseConnected } from "@/lib/supabase";

export default function AgenciesPage() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have a valid Supabase connection
    const checkConnection = async () => {
      const connected = await isSupabaseConnected();
      setIsConnected(connected);
    };
    
    checkConnection();
    // Mettre à jour le titre de la page
    document.title = "Agences | Immobilier";
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['agencies'],
    queryFn: () => getAllAgencies(100, 0),
    enabled: isConnected !== false, // Only run query if connection is valid
  });

  const agencies = data?.agencies || [];
  const totalAgencies = data?.count || 0;

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Agences immobilières</h1>
          <p className="text-muted-foreground">
            {totalAgencies} {totalAgencies > 1 ? 'agences' : 'agence'} à votre service
          </p>
        </div>
        <Link to="/agencies/create">
          <ButtonEffects className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Créer une agence
          </ButtonEffects>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <AnimatedCard key={i} className="p-6 h-52">
              <div className="animate-pulse flex flex-col h-full">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-muted/50 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-muted/50 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-auto pt-4">
                  <div className="h-4 bg-muted/50 rounded w-full"></div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      ) : error ? (
        <AnimatedCard className="p-6 text-center">
          <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Impossible de charger les agences</h3>
          <p className="text-muted-foreground">Veuillez réessayer ultérieurement</p>
        </AnimatedCard>
      ) : agencies.length === 0 ? (
        <AnimatedCard className="p-8 text-center">
          <Building className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-2xl font-medium mb-4">Aucune agence trouvée</h3>
          <p className="text-muted-foreground mb-6">
            Soyez le premier à créer une agence immobilière sur notre plateforme.
          </p>
          <Link to="/agencies/create">
            <ButtonEffects className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Créer une agence
            </ButtonEffects>
          </Link>
        </AnimatedCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agencies.map((agency) => (
            <AgencyCard key={agency.id} agency={agency} />
          ))}
        </div>
      )}
    </div>
  );
}
