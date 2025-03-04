
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, Home, User, FileText, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export default function LeaseDetailsPage() {
  const { agencyId, propertyId, leaseId } = useParams();
  const navigate = useNavigate();
  const [lease, setLease] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaseDetails = async () => {
      if (!leaseId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('leases')
          .select(`
            *,
            tenants:tenant_id (
              id,
              first_name,
              last_name,
              email,
              phone,
              profession,
              photo_url
            ),
            properties:property_id (
              id,
              title,
              location,
              type,
              image_url
            )
          `)
          .eq('id', leaseId)
          .single();

        if (error) throw error;
        setLease(data);
      } catch (error: any) {
        console.error("Error fetching lease details:", error);
        toast.error(`Impossible de récupérer les détails du bail: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaseDetails();
  }, [leaseId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expiré</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Brouillon</Badge>;
      default:
        return <Badge>{status}</Badge>;
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

  if (!lease) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-500">Bail non trouvé</CardTitle>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate(`/agencies/${agencyId}/properties/${propertyId}/tenants`)}>
              Retour à la liste des locataires
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => navigate(`/agencies/${agencyId}/properties/${propertyId}/tenants`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>

      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                Détails du bail {getStatusBadge(lease.status)}
              </CardTitle>
              <CardDescription>
                Informations complètes sur le contrat de location
              </CardDescription>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate(`/agencies/${agencyId}/properties/${propertyId}/leases/${leaseId}/payments`)}
            >
              <CreditCard className="mr-2 h-4 w-4" /> Voir les paiements
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Property Information */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 font-medium flex items-center">
              <Home className="mr-2 h-4 w-4" /> Propriété
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4">
                {lease.properties?.image_url ? (
                  <img 
                    src={lease.properties.image_url} 
                    alt={lease.properties.title} 
                    className="h-16 w-16 object-cover rounded-md"
                  />
                ) : (
                  <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center">
                    <Home className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{lease.properties?.title || "Propriété inconnue"}</h3>
                  <p className="text-sm text-muted-foreground">{lease.properties?.location || "Emplacement non spécifié"}</p>
                  <p className="text-sm text-muted-foreground">{lease.properties?.type || "Type non spécifié"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tenant Information */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 font-medium flex items-center">
              <User className="mr-2 h-4 w-4" /> Locataire
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4">
                {lease.tenants?.photo_url ? (
                  <img 
                    src={lease.tenants.photo_url} 
                    alt={`${lease.tenants.first_name} ${lease.tenants.last_name}`} 
                    className="h-16 w-16 object-cover rounded-full"
                  />
                ) : (
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">
                    {lease.tenants ? `${lease.tenants.first_name} ${lease.tenants.last_name}` : "Locataire inconnu"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{lease.tenants?.email || "Email non spécifié"}</p>
                  <p className="text-sm text-muted-foreground">{lease.tenants?.phone || "Téléphone non spécifié"}</p>
                  {lease.tenants?.profession && (
                    <p className="text-sm text-muted-foreground">{lease.tenants.profession}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Lease Terms */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 font-medium flex items-center">
              <FileText className="mr-2 h-4 w-4" /> Conditions du bail
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Période de bail</p>
                  <p className="font-medium">
                    {lease.start_date ? format(new Date(lease.start_date), 'dd/MM/yyyy') : "Non défini"} - 
                    {lease.end_date ? format(new Date(lease.end_date), 'dd/MM/yyyy') : "Non défini"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Loyer mensuel</p>
                  <p className="font-medium">{formatCurrency(lease.monthly_rent || 0, "EUR")}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Caution</p>
                  <p className="font-medium">{formatCurrency(lease.security_deposit || 0, "EUR")}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Jour de paiement</p>
                  <p className="font-medium">{lease.payment_day || 1}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Type de bail</p>
                  <p className="font-medium">{lease.lease_type || "Standard"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Fréquence de paiement</p>
                  <p className="font-medium">
                    {lease.payment_frequency === 'monthly' ? 'Mensuel' :
                    lease.payment_frequency === 'quarterly' ? 'Trimestriel' :
                    lease.payment_frequency === 'biannual' ? 'Semestriel' :
                    lease.payment_frequency === 'annual' ? 'Annuel' :
                    lease.payment_frequency || 'Non spécifié'}
                  </p>
                </div>
              </div>
              
              {lease.special_conditions && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Conditions particulières</p>
                  <p className="font-medium whitespace-pre-line">{lease.special_conditions}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/agencies/${agencyId}/properties/${propertyId}/tenants`)}
          >
            Retour
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate(`/agencies/${agencyId}/properties/${propertyId}/leases/${leaseId}/payments`)}
            >
              <CreditCard className="mr-2 h-4 w-4" /> Gérer les paiements
            </Button>
            <Button>
              <Calendar className="mr-2 h-4 w-4" /> Éditer le bail
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
