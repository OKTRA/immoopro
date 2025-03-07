import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LeaseList from '@/components/leases/LeaseList';
import { supabase } from "@/lib/supabase";
import { getLeasesByAgencyId, getLeasesByPropertyId } from '@/services/tenant/leaseService';

interface LeaseListContainerProps {
  agencyId: string;
  propertyId?: string;
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
  tenants?: {
    first_name: string;
    last_name: string;
  };
  properties?: {
    title: string;
  };
}

export default function LeaseListContainer({ agencyId, propertyId }: LeaseListContainerProps) {
  const navigate = useNavigate();
  const [leases, setLeases] = useState<LeaseData[]>([]);
  const [fetchingLeases, setFetchingLeases] = useState(false);
  
  useEffect(() => {
    fetchLeases();
  }, [propertyId, agencyId]);
  
  const fetchLeases = async () => {
    if (!agencyId) return;
    
    setFetchingLeases(true);
    try {
      console.log('Fetching leases...');
      console.log(`Agency ID: ${agencyId}, Property ID: ${propertyId || 'none'}`);
      
      // Vérifier si l'agence existe
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .select('id, name')
        .eq('id', agencyId)
        .maybeSingle();
        
      if (agencyError) {
        console.error('Error checking agency:', agencyError);
        throw agencyError;
      }
      
      if (!agencyData) {
        console.warn(`Agency not found with ID: ${agencyId}`);
        toast.error("Agence non trouvée. Vérifiez l'identifiant de l'agence.");
        setFetchingLeases(false);
        return;
      }
      
      console.log('Agency found:', agencyData);
      
      let result;
      
      if (propertyId) {
        console.log(`Fetching leases for property ${propertyId}`);
        result = await getLeasesByPropertyId(propertyId);
      } else {
        console.log(`Fetching leases for agency ${agencyId}`);
        result = await getLeasesByAgencyId(agencyId);
      }
      
      const { leases, error } = result;
      
      if (error) {
        console.error('Error fetching leases:', error);
        throw new Error(error);
      }
      
      console.log('Fetched leases:', leases);
      setLeases(leases || []);
    } catch (error: any) {
      console.error("Error fetching leases:", error);
      toast.error(`Erreur lors du chargement des baux: ${error.message}`);
    } finally {
      setFetchingLeases(false);
    }
  };

  const handleViewLeaseDetails = (leaseId: string) => {
    if (!agencyId) return;
    
    const lease = leases.find(l => l.id === leaseId);
    const leasePropertyId = lease?.property_id || propertyId;
    
    if (leasePropertyId) {
      navigate(`/agencies/${agencyId}/properties/${leasePropertyId}/leases/${leaseId}`);
    } else {
      toast.error("Impossible de trouver la propriété associée à ce bail");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Liste des Baux</h2>
        <Button onClick={() => navigate(`/agencies/${agencyId}/properties/${propertyId || ''}/lease/create`)}>
          Créer un nouveau bail
        </Button>
      </div>
      
      <LeaseList 
        leases={leases} 
        loading={fetchingLeases} 
        onViewLeaseDetails={handleViewLeaseDetails} 
      />
    </div>
  );
}
