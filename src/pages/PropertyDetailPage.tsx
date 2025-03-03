
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPropertyById } from "@/services/propertyService";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Home, 
  Map, 
  Users, 
  FileText, 
  Edit, 
  Trash, 
  ArrowLeft, 
  PiggyBank,
  Calendar,
  MapPin,
  Ruler,
  Hotel,
  Bath,
  Check,
  X,
  Tag,
  Building2,
  Plus,
  ArrowUpRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function PropertyDetailPage() {
  const { agencyId, propertyId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");

  // Fetch property details
  const { 
    data: propertyData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getPropertyById(propertyId || ''),
    enabled: !!propertyId
  });

  // Handle error cases
  useEffect(() => {
    if (error) {
      toast.error("Impossible de charger les détails de la propriété");
      navigate(`/agencies/${agencyId}`);
    }
  }, [error, navigate, agencyId]);

  const property = propertyData?.property;

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 w-1/3 bg-muted rounded mb-4"></div>
          <div className="h-64 bg-muted rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2 h-60 bg-muted rounded"></div>
            <div className="h-60 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Handle property not found
  if (!property) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="text-center p-8 max-w-md mx-auto">
          <CardHeader>
            <div className="mx-auto bg-muted rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Propriété non trouvée</CardTitle>
            <CardDescription>
              Cette propriété n'existe pas ou a été supprimée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate(`/agencies/${agencyId}`)}
              className="mt-4"
            >
              Retour à l'agence
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPropertyStatus = (status: string) => {
    switch (status) {
      case "available":
        return { label: "Disponible", variant: "default" as const };
      case "sold":
        return { label: "Vendu", variant: "destructive" as const };
      case "pending":
        return { label: "En attente", variant: "secondary" as const };
      case "rented":
        return { label: "Loué", variant: "outline" as const };
      default:
        return { label: status, variant: "outline" as const };
    }
  };

  const statusInfo = formatPropertyStatus(property.status);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button and header */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/agencies/${agencyId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'agence
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/agencies/${agencyId}/properties/${propertyId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Link>
            </Button>
            <Button variant="destructive">
              <Trash className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      {/* Property main image */}
      <div className="mb-8 relative overflow-hidden rounded-lg h-96">
        {property.imageUrl ? (
          <img 
            src={property.imageUrl} 
            alt={property.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Home className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <Badge 
          className="absolute top-4 right-4 text-sm px-3 py-1" 
          variant={statusInfo.variant}
        >
          {statusInfo.label}
        </Badge>
      </div>

      {/* Property details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Détails de la propriété</CardTitle>
                  <CardDescription>Informations sur cette propriété</CardDescription>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(property.price, "EUR")}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="financial">Financier</TabsTrigger>
                  <TabsTrigger value="leases">Baux</TabsTrigger>
                  <TabsTrigger value="tenants">Locataires</TabsTrigger>
                </TabsList>

                {/* Details tab */}
                <TabsContent value="details">
                  {/* Basic property details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-muted/40 p-4 rounded-lg text-center">
                      <Ruler className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">Surface</div>
                      <div className="font-medium">{property.area} m²</div>
                    </div>
                    <div className="bg-muted/40 p-4 rounded-lg text-center">
                      <Hotel className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">Chambres</div>
                      <div className="font-medium">{property.bedrooms}</div>
                    </div>
                    <div className="bg-muted/40 p-4 rounded-lg text-center">
                      <Bath className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">Salles de bain</div>
                      <div className="font-medium">{property.bathrooms}</div>
                    </div>
                    <div className="bg-muted/40 p-4 rounded-lg text-center">
                      <Tag className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">Type</div>
                      <div className="font-medium">{property.type}</div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Localisation</h3>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{property.location}</span>
                    </div>
                  </div>

                  {/* Features */}
                  {property.features && property.features.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Caractéristiques</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {property.features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <Check className="h-4 w-4 text-primary mr-2" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {property.description || "Aucune description disponible pour cette propriété."}
                    </p>
                  </div>

                  {/* Additional details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {property.yearBuilt && (
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-muted-foreground">Année de construction</span>
                        <span className="font-medium">{property.yearBuilt}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-muted-foreground">Meublé</span>
                      <span>
                        {property.furnished ? 
                          <Check className="h-4 w-4 text-green-500" /> : 
                          <X className="h-4 w-4 text-red-500" />
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-muted-foreground">Animaux autorisés</span>
                      <span>
                        {property.petsAllowed ? 
                          <Check className="h-4 w-4 text-green-500" /> : 
                          <X className="h-4 w-4 text-red-500" />
                        }
                      </span>
                    </div>
                    {property.propertyCategory && (
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-muted-foreground">Catégorie</span>
                        <span className="font-medium">{property.propertyCategory}</span>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Financial tab */}
                <TabsContent value="financial">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted/40 p-4 rounded-lg">
                        <PiggyBank className="h-5 w-5 mb-1 text-muted-foreground" />
                        <div className="text-sm text-muted-foreground">Prix</div>
                        <div className="font-bold text-lg">{formatCurrency(property.price, "EUR")}</div>
                      </div>
                      
                      {property.securityDeposit && (
                        <div className="bg-muted/40 p-4 rounded-lg">
                          <FileText className="h-5 w-5 mb-1 text-muted-foreground" />
                          <div className="text-sm text-muted-foreground">Dépôt de garantie</div>
                          <div className="font-bold text-lg">{formatCurrency(property.securityDeposit, "EUR")}</div>
                        </div>
                      )}
                      
                      {property.agencyFees && (
                        <div className="bg-muted/40 p-4 rounded-lg">
                          <Building2 className="h-5 w-5 mb-1 text-muted-foreground" />
                          <div className="text-sm text-muted-foreground">Frais d'agence</div>
                          <div className="font-bold text-lg">{formatCurrency(property.agencyFees, "EUR")}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {property.paymentFrequency && (
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="text-muted-foreground">Fréquence de paiement</span>
                          <span className="font-medium">
                            {property.paymentFrequency === "monthly" ? "Mensuel" :
                             property.paymentFrequency === "quarterly" ? "Trimestriel" :
                             property.paymentFrequency === "biannual" ? "Semestriel" :
                             property.paymentFrequency === "annual" ? "Annuel" :
                             property.paymentFrequency}
                          </span>
                        </div>
                      )}
                      
                      {property.commissionRate && (
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="text-muted-foreground">Taux de commission</span>
                          <span className="font-medium">{property.commissionRate}%</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="text-lg font-medium mb-4">Gestion financière</h3>
                      <div className="space-y-3">
                        <Link to={`/agencies/${agencyId}/properties/${propertyId}/lease/create`}>
                          <Button variant="outline" className="w-full">
                            <FileText className="h-4 w-4 mr-2" />
                            Créer un nouveau bail
                          </Button>
                        </Link>
                        <Button disabled variant="outline" className="w-full">
                          <PiggyBank className="h-4 w-4 mr-2" />
                          Gérer les paiements
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Leases tab */}
                <TabsContent value="leases">
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Gestion des baux</h3>
                    <p className="text-muted-foreground mb-4">
                      Créez et gérez les baux pour cette propriété
                    </p>
                    <Link to={`/agencies/${agencyId}/properties/${propertyId}/lease/create`}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer un bail
                      </Button>
                    </Link>
                  </div>
                </TabsContent>

                {/* Tenants tab */}
                <TabsContent value="tenants">
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Gestion des locataires</h3>
                    <p className="text-muted-foreground mb-4">
                      Gérez les locataires associés à cette propriété
                    </p>
                    <Link to={`/agencies/${agencyId}/properties/${propertyId}/tenants`}>
                      <Button>
                        <Users className="h-4 w-4 mr-2" />
                        Gérer les locataires
                      </Button>
                    </Link>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick actions card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={`/agencies/${agencyId}/properties/${propertyId}/edit`} className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier la propriété
                </Button>
              </Link>
              
              <Link to={`/agencies/${agencyId}/properties/${propertyId}/lease/create`} className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Créer un bail
                </Button>
              </Link>
              
              <Link to={`/agencies/${agencyId}/properties/${propertyId}/tenants`} className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Gérer les locataires
                </Button>
              </Link>
              
              {property.virtualTourUrl && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={property.virtualTourUrl} target="_blank" rel="noopener noreferrer">
                    <Map className="h-4 w-4 mr-2" />
                    Visite virtuelle
                    <ArrowUpRight className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Property status card */}
          <Card>
            <CardHeader>
              <CardTitle>Statut de la propriété</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Statut actuel</span>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
                
                <Separator />
                
                <div className="pt-2">
                  <Button className="w-full">
                    Changer le statut
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
