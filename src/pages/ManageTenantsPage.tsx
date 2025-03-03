
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getTenantsByPropertyId } from "@/services/tenant/tenantService";
import { supabase } from "@/lib/supabase";
import { UserPlus } from "lucide-react";
import TenantList from '@/components/tenants/TenantList';
import LeaseList from '@/components/leases/LeaseList';
import AddTenantForm from '@/components/tenants/AddTenantForm';
import TenantFilters from '@/components/tenants/TenantFilters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TenantData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  employmentStatus?: string;
  profession?: string;
  photoUrl?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

interface TenantWithLease extends TenantData {
  id?: string;
  hasLease?: boolean;
  leaseId?: string;
  leaseStatus?: string;
}

interface LeaseData {
  id: string;
  tenant_id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  status: string;
  tenant?: {
    first_name: string;
    last_name: string;
  };
  property?: {
    title: string;
  };
}

export default function ManageTenantsPage({ leaseView = false }) {
  const { agencyId, propertyId } = useParams();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantWithLease[]>([]);
  const [leases, setLeases] = useState<LeaseData[]>([]);
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchingTenants, setFetchingTenants] = useState(true);
  const [fetchingLeases, setFetchingLeases] = useState(false);
  const [filterAssigned, setFilterAssigned] = useState(false);

  // Vérifier si les paramètres nécessaires sont présents
  useEffect(() => {
    // Pour la vue des locataires par propriété, nous avons besoin des deux IDs
    if (propertyId && !agencyId) {
      toast.error("ID d'agence manquant");
      navigate("/agencies");
      return;
    }
    
    // Pour la vue des locataires par agence, nous avons seulement besoin de l'agencyId
    if (!agencyId) {
      toast.error("Veuillez sélectionner une agence");
      navigate("/agencies");
      return;
    }
  }, [agencyId, propertyId, navigate]);

  useEffect(() => {
    if (!propertyId) return;
    
    const fetchTenants = async () => {
      setFetchingTenants(true);
      try {
        const { tenants, error } = await getTenantsByPropertyId(propertyId);
        
        if (error) throw new Error(error);
        
        setTenants(tenants || []);
      } catch (error: any) {
        toast.error(`Erreur lors du chargement des locataires: ${error.message}`);
      } finally {
        setFetchingTenants(false);
      }
    };
    
    fetchTenants();
  }, [propertyId]);

  useEffect(() => {
    if (leaseView) {
      fetchLeases();
    }
  }, [leaseView, propertyId, agencyId]);

  const fetchLeases = async () => {
    setFetchingLeases(true);
    try {
      let query = supabase
        .from('leases')
        .select(`
          id,
          tenant_id,
          property_id,
          start_date,
          end_date,
          monthly_rent,
          security_deposit,
          status,
          tenants:tenant_id (
            first_name,
            last_name
          ),
          properties:property_id (
            title
          )
        `);

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      } else if (agencyId) {
        // If only agency ID is provided, need to join with properties to filter by agency
        const { data: agencyProperties } = await supabase
          .from('properties')
          .select('id')
          .eq('agency_id', agencyId);
          
        if (agencyProperties && agencyProperties.length > 0) {
          const propertyIds = agencyProperties.map(prop => prop.id);
          query = query.in('property_id', propertyIds);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      
      console.log("Fetched leases:", data);
      setLeases(data || []);
    } catch (error: any) {
      console.error("Error fetching leases:", error);
      toast.error(`Erreur lors du chargement des baux: ${error.message}`);
    } finally {
      setFetchingLeases(false);
    }
  };

  const handleCreateLease = (tenantId: string) => {
    if (!propertyId || !agencyId) return;
    navigate(`/agencies/${agencyId}/properties/${propertyId}/lease/create?tenantId=${tenantId}`);
  };

  const handleAssignTenant = (tenantId: string) => {
    if (!propertyId || !agencyId) return;
    navigate(`/agencies/${agencyId}/properties/${propertyId}/lease/create?tenantId=${tenantId}&quickAssign=true`);
  };

  const handleViewLeaseDetails = (leaseId: string) => {
    if (!agencyId) return;
    navigate(`/agencies/${agencyId}/properties/${propertyId}/leases/${leaseId}/payments`);
  };

  const handleAddTenantSuccess = (newTenant: TenantWithLease) => {
    setTenants([...tenants, newTenant]);
    setIsAddingTenant(false);
  };

  const filteredTenants = tenants
    .filter(tenant => {
      const fullName = `${tenant.firstName} ${tenant.lastName}`.toLowerCase();
      const email = tenant.email?.toLowerCase() || '';
      const phone = tenant.phone?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      
      return fullName.includes(query) || email.includes(query) || phone.includes(query);
    })
    .filter(tenant => !filterAssigned || tenant.hasLease);

  // Si les IDs nécessaires sont manquants, afficher un message approprié
  if (!agencyId) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Accès non autorisé</CardTitle>
            <CardDescription>
              Vous devez sélectionner une agence pour accéder à cette page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/agencies")}>
              Retour à la liste des agences
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si nous sommes dans la vue propriété mais que l'ID de propriété est manquant
  if (!propertyId && !leaseView) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des locataires</CardTitle>
            <CardDescription>
              Veuillez sélectionner une propriété pour gérer ses locataires.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(`/agencies/${agencyId}`)}>
              Retour aux propriétés de l'agence
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        {leaseView ? "Gestion des Baux" : "Gestion des Locataires"}
      </h1>
      
      {leaseView ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Liste des Baux</h2>
            <Button onClick={() => navigate(`/agencies/${agencyId}/properties/${propertyId}/lease/create`)}>
              Créer un nouveau bail
            </Button>
          </div>
          
          <LeaseList 
            leases={leases} 
            loading={fetchingLeases} 
            onViewLeaseDetails={handleViewLeaseDetails} 
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Gérer les locataires</h1>
              <p className="text-gray-600 mb-4">
                Agence ID: {agencyId} {propertyId && `| Propriété ID: ${propertyId}`}
              </p>
            </div>
            <Button onClick={() => setIsAddingTenant(true)} className="mt-2 md:mt-0">
              <UserPlus className="mr-2 h-4 w-4" /> Ajouter un locataire
            </Button>
          </div>

          <TenantFilters 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterAssigned={filterAssigned}
            setFilterAssigned={setFilterAssigned}
          />

          <TenantList 
            tenants={filteredTenants}
            loading={fetchingTenants}
            searchQuery={searchQuery}
            agencyId={agencyId}
            propertyId={propertyId}
            handleCreateLease={handleCreateLease}
            handleAssignTenant={handleAssignTenant}
          />

          {isAddingTenant ? (
            <AddTenantForm 
              onCancel={() => setIsAddingTenant(false)} 
              onSuccess={handleAddTenantSuccess} 
            />
          ) : filteredTenants.length === 0 && !searchQuery && (
            <Button onClick={() => setIsAddingTenant(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Ajouter un locataire
            </Button>
          )}
        </>
      )}
    </div>
  );
}
