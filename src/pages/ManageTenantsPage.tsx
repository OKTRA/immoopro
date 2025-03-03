
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPropertyById } from "@/services/propertyService";
import { Property, Tenant } from "@/assets/types";
import { ArrowLeft, UserPlus, House, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import TenantForm from "@/components/tenants/TenantForm";
import { createTenant, getLeasesByTenantId } from "@/services/tenantService";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";

export default function ManageTenantsPage() {
  const { agencyId, propertyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState<Partial<Tenant>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;
      
      try {
        const { property, error } = await getPropertyById(propertyId);
        if (error) throw new Error(error);
        setProperty(property);
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: `Impossible de récupérer les détails de la propriété: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, toast]);

  const handleTenantDataChange = (data: Partial<Tenant>) => {
    setTenantData(prev => ({ ...prev, ...data }));
  };

  const handleFinish = () => {
    toast({
      title: "Processus terminé",
      description: "La propriété a été créée avec succès."
    });
    navigate(`/agencies/${agencyId}`);
  };

  const handleSubmit = async () => {
    if (!tenantData.email || !tenantData.firstName || !tenantData.lastName || !tenantData.phone) {
      toast({
        title: "Données incomplètes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    try {
      const { tenant, error } = await createTenant({
        ...tenantData as Omit<Tenant, 'id'>
      });
      
      if (error) throw new Error(error);
      
      // Get tenant leases
      const { leases } = await getLeasesByTenantId(tenant.id);
      
      toast({
        title: "Locataire créé avec succès",
        description: leases.length > 0 
          ? "Le locataire a été associé au bail." 
          : "Le locataire a été créé mais n'est pas encore associé à un bail."
      });
      
      setTimeout(() => {
        navigate(`/agencies/${agencyId}`);
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Erreur lors de la création du locataire",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Chargement...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-500">Propriété non trouvée</CardTitle>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate(`/agencies/${agencyId}`)}>
              Retour à l'agence
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Gestion des locataires</CardTitle>
          <CardDescription>
            Ajoutez des locataires pour la propriété "{property.title}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center gap-2 text-blue-600 mb-4">
              <House className="h-5 w-5" />
              <h3 className="font-medium">{property.title}</h3>
              <span className="text-muted-foreground text-sm">
                ({property.bedrooms} ch. | {property.bathrooms} sdb | {property.area} m²)
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="h-4 w-4" />
              <span>
                {property.status === "available" 
                  ? "Disponible immédiatement" 
                  : `Statut: ${property.status}`}
              </span>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Ajouter un locataire</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleFinish}
              >
                Terminer sans ajouter de locataire
              </Button>
            </div>
            
            <TenantForm
              initialData={tenantData}
              onUpdate={handleTenantDataChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/agencies/${agencyId}/properties/${propertyId}/lease`)}
            disabled={submitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={submitting}
          >
            <UserPlus className="h-4 w-4 mr-2" /> 
            {submitting ? "Création..." : "Ajouter le locataire"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
