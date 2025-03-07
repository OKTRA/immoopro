
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LeaseList from '@/components/leases/LeaseList';
import { supabase } from "@/lib/supabase";

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
      
      if (propertyId) {
        console.log(`Fetching leases for property ${propertyId}`);
        const { data, error } = await supabase
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
          `)
          .eq('property_id', propertyId);

        if (error) throw error;
        
        console.log("Fetched leases for property:", data);
        setLeases(data || []);
      } else if (agencyId) {
        const { data, error } = await supabase
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
          `)
          .eq('properties.agency_id', agencyId)
          .order('start_date', { ascending: false });

        if (error) throw error;
        
        console.log("Fetched leases for agency:", data);
        setLeases(data || []);
      }
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
  );
}
