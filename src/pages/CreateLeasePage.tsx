
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPropertyById } from "@/services/propertyService";
import { Property, ApartmentLease } from "@/assets/types";
import { ArrowLeft, ArrowRight, BadgeCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import LeaseDetailsForm from "@/components/leases/LeaseDetailsForm";
import { createLease } from "@/services/tenantService";

interface LeaseFormData {
  propertyId?: string;
  apartmentId?: string;
  tenantId?: string;
  startDate?: string;
  endDate?: string;
  paymentStartDate?: string;
  monthly_rent?: number;
  security_deposit?: number;
  payment_day?: number;
  is_active?: boolean;
  signed_by_tenant?: boolean;
  signed_by_owner?: boolean;
  has_renewal_option?: boolean;
  lease_type?: string;
  special_conditions?: string;
  status?: string;
  payment_frequency?: string;
}

export default function CreateLeasePage() {
  const { agencyId, propertyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaseData, setLeaseData] = useState<LeaseFormData>({
    propertyId,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    paymentStartDate: new Date().toISOString().split('T')[0], // Par défaut, même date que startDate
    status: "pending",
  });
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

  const handleLeaseDataChange = (data: Partial<LeaseFormData>) => {
    setLeaseData(prev => ({ ...prev, ...data }));
  };

  const handleSkip = () => {
    navigate(`/agencies/${agencyId}/properties/${propertyId}/tenants`);
  };

  const handleSubmit = async () => {
    if (!property || !propertyId) return;
    
    setSubmitting(true);
    try {
      const completeLeaseData: any = {
        ...leaseData,
        propertyId: propertyId,
        apartmentId: propertyId,
        tenantId: leaseData.tenantId || "00000000-0000-0000-0000-000000000000",
        startDate: leaseData.startDate || new Date().toISOString().split('T')[0],
        endDate: leaseData.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        paymentStartDate: leaseData.paymentStartDate || leaseData.startDate,
        payment_frequency: leaseData.payment_frequency || property.paymentFrequency || "monthly",
        monthly_rent: property.price || 0,
        security_deposit: property.securityDeposit || property.price || 0,
        is_active: false,
        payment_day: leaseData.payment_day || 1,
        signed_by_tenant: false,
        signed_by_owner: false,
        has_renewal_option: leaseData.has_renewal_option || false,
        lease_type: property.propertyCategory || "residence",
        special_conditions: leaseData.special_conditions || "",
        status: "draft"
      };
      
      const { lease, error } = await createLease(completeLeaseData);
      if (error) throw new Error(error);
      
      toast({
        title: "Bail créé avec succès",
        description: "Vous allez être redirigé vers la page de gestion des locataires."
      });
      
      setTimeout(() => {
        navigate(`/agencies/${agencyId}/properties/${propertyId}/tenants`);
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Erreur lors de la création du bail",
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
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">Configuration du bail</CardTitle>
              <CardDescription>
                Définissez les termes du bail pour la propriété "{property.title}"
              </CardDescription>
            </div>
            <div className="rounded-full bg-blue-100 p-2 text-blue-700">
              <BadgeCheck className="h-6 w-6" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LeaseDetailsForm
            property={property}
            initialData={leaseData}
            onUpdate={handleLeaseDataChange}
          />
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/agencies/${agencyId}/properties/${propertyId}`)}
            disabled={submitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              disabled={submitting}
            >
              Ignorer cette étape
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Création..." : "Créer le bail"} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
