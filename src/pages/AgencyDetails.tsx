
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe,

  Edit,
  Home,
  Star,
  BadgeCheck,
  ArrowLeft,
  CalendarClock,
  ChevronRight
} from "lucide-react";
import { getAgencyById, getAgencyStatistics, getPropertiesByAgencyId } from "@/services/agencyService";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import PropertyCard from "@/components/PropertyCard";

const AgencyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userRole } = useUser();
  
  const { data: agencyData, isLoading: isLoadingAgency, error: agencyError } = useQuery({
    queryKey: ["agency", id],
    queryFn: () => getAgencyById(id!),
    enabled: !!id,
  });

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["agency-stats", id],
    queryFn: () => getAgencyStatistics(id!),
    enabled: !!id,
  });

  const { data: propertiesData, isLoading: isLoadingProperties } = useQuery({
    queryKey: ["agency-properties", id],
    queryFn: () => getPropertiesByAgencyId(id!, 3, 0),
    enabled: !!id,
  });

  const agency = agencyData?.agency;
  const statistics = statsData?.statistics;
  const properties = propertiesData?.properties || [];
  
  const isAdmin = userRole === "admin";
  const isAgencyOwner = userRole === "agency"; // In a real app, check if current user owns this agency
  const canEdit = isAdmin || isAgencyOwner;

  if (isLoadingAgency) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (agencyError || !agency) {
    toast.error("Erreur de chargement de l'agence", {
      description: agencyError?.toString() || "Agence non trouvée"
    });
    return (
      <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => navigate("/agencies")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux agences
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Agence non trouvée</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              L'agence demandée n'existe pas ou vous n'avez pas les permissions nécessaires.
            </p>
            <Button onClick={() => navigate("/agencies")}>
              Voir toutes les agences
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <Button variant="outline" onClick={() => navigate("/agencies")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux agences
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{agency.name}</h1>
            {agency.verified && (
              <Badge variant="default" className="bg-green-500">
                <BadgeCheck className="h-4 w-4 mr-1" /> Vérifié
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1" /> {agency.location || "Emplacement non spécifié"}
          </div>
        </div>
        {canEdit && (
          <Button onClick={() => navigate(`/agencies/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Modifier l'agence
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 flex justify-center">
                  {agency.logoUrl ? (
                    <img 
                      src={agency.logoUrl} 
                      alt={`${agency.name} logo`} 
                      className="rounded-lg h-48 w-48 object-cover"
                    />
                  ) : (
                    <div className="rounded-lg h-48 w-48 bg-muted flex items-center justify-center">
                      <Building2 className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-xl font-semibold mb-4">À propos</h3>
                  <p className="text-muted-foreground mb-6">
                    {agency.description || "Aucune description disponible pour cette agence."}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>{agency.email || "Email non disponible"}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>{agency.phone || "Téléphone non disponible"}</span>
                    </div>
                    {agency.website && (
                      <div className="flex items-center col-span-2">
                        <Globe className="h-5 w-5 mr-2 text-muted-foreground" />
                        <a 
                          href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {agency.website}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Specialties */}
                  {agency.specialties && agency.specialties.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Spécialités</h4>
                      <div className="flex flex-wrap gap-2">
                        {agency.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Service Areas */}
                  {agency.serviceAreas && agency.serviceAreas.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Zones de service</h4>
                      <div className="flex flex-wrap gap-2">
                        {agency.serviceAreas.map((area, index) => (
                          <Badge key={index} variant="outline">
                            <MapPin className="h-3 w-3 mr-1" /> {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Performance de l'agence</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                      <div className="flex items-center">
                        <Home className="h-5 w-5 mr-3 text-blue-500" />
                        <span>Propriétés</span>
                      </div>
                      <span className="font-medium">{statistics?.propertiesCount || agency.properties || 0}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 mr-3 text-amber-500" />
                        <span>Note moyenne</span>
                      </div>
                      <span className="font-medium">{agency.rating ? `${agency.rating}/5.0` : "N/A"}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                      <div className="flex items-center">
                        <CalendarClock className="h-5 w-5 mr-3 text-green-500" />
                        <span>Annonces récentes</span>
                      </div>
                      <span className="font-medium">{statistics?.recentListings?.length || 0}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Properties Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Propriétés</h2>
          <Button variant="outline" asChild>
            <Link to={`/properties?agencyId=${id}`}>
              Voir toutes <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {isLoadingProperties ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : properties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Home className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-1">Aucune propriété</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                Cette agence n'a pas encore de propriétés répertoriées.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyDetails;
