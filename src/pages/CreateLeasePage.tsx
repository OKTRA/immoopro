
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPropertyById } from "@/services/propertyService";
import { getTenantById } from "@/services/tenant/tenantService";
import { Property, ApartmentLease, Tenant } from "@/assets/types";
import { ArrowLeft, ArrowRight, BadgeCheck, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import LeaseDetailsForm from "@/components/leases/LeaseDetailsForm";
import { createLease } from "@/services/tenant/leaseService";

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
  const location = useLocation();
  const { toast } = useToast();
  
  const queryParams = new URLSearchParams(location.search);
  const tenantId = queryParams.get('tenantId');
  const quickAssign = queryParams.get('quickAssign') === 'true';
  
  // Calculate default dates
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  
  const defaultStartDate = today.toISOString().split('T')[0];
  const defaultEndDate = nextYear.toISOString().split('T')[0];
  
  const [property, setProperty] = useState<Property | null>(null);
  const [tenant, setTenant] = useState<Partial<Tenant> | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaseData, setLeaseData] = useState<LeaseFormData>({
    propertyId,
    tenantId: tenantId || undefined,
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    paymentStartDate: defaultStartDate,
    status: "pending",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!propertyId) return;
      
      setLoading(true);
      try {
        const { property, error: propertyError } = await getPropertyById(propertyId);
        if (propertyError) throw new Error(propertyError);
        setProperty(property);
        
        if (tenantId) {
          const { tenant, error: tenantError } = await getTenantById(tenantId);
          if (tenantError) throw new Error(tenantError);
          setTenant(tenant);
        }
        
        if (quickAssign && property) {
          // For quick assign, set a 3-month lease by default
          const threeMonthsLater = new Date(today);
          threeMonthsLater.setMonth(today.getMonth() + 3);
          
          setLeaseData(prev => ({
            ...prev,
            propertyId,
            tenantId: tenantId || undefined,
            startDate: defaultStartDate,
            endDate: threeMonthsLater.toISOString().split('T')[0],
            paymentStartDate: defaultStartDate,
            monthly_rent: property.price,
            security_deposit: property.securityDeposit || property.price,
            payment_frequency: property.paymentFrequency || 'monthly',
            status: "active",
            is_active: true,
          }));
        }
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: `Impossible de récupérer les données: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, tenantId, quickAssign, toast]);

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
        tenantId: leaseData.tenantId || tenantId || "00000000-0000-0000-0000-000000000000",
        startDate: leaseData.startDate || defaultStartDate,
        endDate: leaseData.endDate || defaultEndDate,
        paymentStartDate: leaseData.paymentStartDate || leaseData.startDate,
        payment_frequency: leaseData.payment_frequency || property.paymentFrequency || "monthly",
        monthly_rent: leaseData.monthly_rent || property.price || 0,
        security_deposit: leaseData.security_deposit || property.securityDeposit || property.price || 0,
        is_active: quickAssign ? true : false,
        payment_day: leaseData.payment_day || 1,
        signed_by_tenant: quickAssign ? true : false,
        signed_by_owner: quickAssign ? true : false,
        has_renewal_option: leaseData.has_renewal_option || false,
        lease_type: property.propertyCategory || "residence",
        special_conditions: leaseData.special_conditions || "",
        status: quickAssign ? "active" : "draft"
      };
      
      console.log('Submitting lease data:', completeLeaseData);
      
      const { lease, error } = await createLease(completeLeaseData);
      if (error) throw new Error(error);
      
      toast({
        title: quickAssign ? "Locataire attribué avec succès" : "Bail créé avec succès",
        description: "Vous allez être redirigé vers la page de gestion des locataires."
      });
      
      setTimeout(() => {
        navigate(`/agencies/${agencyId}/properties/${propertyId}/tenants`);
      }, 1500);
    } catch (error: any) {
      toast({
        title: quickAssign ? "Erreur lors de l'attribution du locataire" : "Erreur lors de la création du bail",
        description: error.message,
        variant: "destructive"
      });
      console.error('Error submitting lease:', error);
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
              <CardTitle className="text-2xl font-bold">
                {quickAssign ? "Attribution rapide à la propriété" : "Configuration du bail"}
              </CardTitle>
              <CardDescription>
                {quickAssign 
                  ? `Attribution du locataire à la propriété "${property.title}"` 
                  : `Définissez les termes du bail pour la propriété "${property.title}"`}
              </CardDescription>
              
              {tenant && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-secondary/50 rounded-md">
                  {tenant.photoUrl ? (
                    <img
                      src={tenant.photoUrl}
                      alt={`${tenant.firstName} ${tenant.lastName}`}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {tenant.firstName} {tenant.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{tenant.email}</p>
                  </div>
                </div>
              )}
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
            quickAssign={quickAssign}
          />
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/agencies/${agencyId}/properties/${propertyId}/tenants`)}
            disabled={submitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
          <div className="flex gap-2">
            {!quickAssign && (
              <Button 
                variant="outline" 
                onClick={handleSkip}
                disabled={submitting}
              >
                Ignorer cette étape
              </Button>
            )}
            <Button 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting 
                ? (quickAssign ? "Attribution..." : "Création...") 
                : (quickAssign ? "Attribuer le locataire" : "Créer le bail")} 
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
