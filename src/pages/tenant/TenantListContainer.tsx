
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import TenantList from '@/components/tenants/TenantList';
import AddTenantForm from '@/components/tenants/AddTenantForm';
import TenantFilters from '@/components/tenants/TenantFilters';
import { EmptyState } from "@/components/ui/empty-state";
import { getTenantsByPropertyId, getTenantsByAgencyId } from '@/services/tenant/tenantService';
import { TenantWithLease } from '@/components/tenants/types';

interface TenantListContainerProps {
  agencyId: string;
  propertyId?: string;
}

export default function TenantListContainer({ agencyId, propertyId }: TenantListContainerProps) {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantWithLease[]>([]);
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchingTenants, setFetchingTenants] = useState(true);
  const [filterAssigned, setFilterAssigned] = useState(false);

  useEffect(() => {
    if (!agencyId) return;
    
    const fetchTenants = async () => {
      setFetchingTenants(true);
      try {
        console.log(`Fetching tenants for agency ${agencyId}${propertyId ? ` and property ${propertyId}` : ''}`);
        let result;
        
        if (propertyId) {
          result = await getTenantsByPropertyId(propertyId);
        } else {
          result = await getTenantsByAgencyId(agencyId);
        }
        
        const { tenants, error } = result;
        
        if (error) {
          console.error('Error fetching tenants:', error);
          throw new Error(error);
        }
        
        console.log('Fetched tenants:', tenants);
        setTenants(tenants || []);
      } catch (error: any) {
        console.error('Error in tenant fetch:', error);
        toast.error(`Erreur lors du chargement des locataires: ${error.message}`);
      } finally {
        setFetchingTenants(false);
      }
    };
    
    fetchTenants();
  }, [propertyId, agencyId]);

  const handleCreateLease = (tenantId: string, propertyIdToUse?: string) => {
    if (!agencyId) return;
    
    const targetPropertyId = propertyIdToUse || propertyId;
    
    if (targetPropertyId) {
      navigate(`/agencies/${agencyId}/properties/${targetPropertyId}/lease/create?tenantId=${tenantId}`);
    } else {
      toast.info("Veuillez sélectionner une propriété pour créer un bail");
      navigate(`/agencies/${agencyId}`);
    }
  };

  const handleAssignTenant = (tenantId: string, propertyIdToUse?: string) => {
    if (!agencyId) return;
    
    const targetPropertyId = propertyIdToUse || propertyId;
    
    if (targetPropertyId) {
      navigate(`/agencies/${agencyId}/properties/${targetPropertyId}/lease/create?tenantId=${tenantId}&quickAssign=true`);
    } else {
      toast.info("Veuillez sélectionner une propriété pour attribuer un locataire");
      navigate(`/agencies/${agencyId}`);
    }
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

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {propertyId ? "Gérer les locataires de la propriété" : "Tous les locataires de l'agence"}
          </h1>
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

      {fetchingTenants ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : tenants.length > 0 ? (
        <TenantList 
          tenants={filteredTenants}
          loading={fetchingTenants}
          searchQuery={searchQuery}
          agencyId={agencyId}
          propertyId={propertyId}
          handleCreateLease={handleCreateLease}
          handleAssignTenant={handleAssignTenant}
        />
      ) : (
        <EmptyState
          title={propertyId ? "Aucun locataire pour cette propriété" : "Aucun locataire dans cette agence"}
          description="Ajoutez des locataires pour les assigner à vos propriétés"
          action={
            <Button onClick={() => setIsAddingTenant(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Ajouter un locataire
            </Button>
          }
        />
      )}

      {isAddingTenant && (
        <AddTenantForm 
          onCancel={() => setIsAddingTenant(false)} 
          onSuccess={handleAddTenantSuccess}
          agencyId={agencyId}
        />
      )}
    </>
  );
}
