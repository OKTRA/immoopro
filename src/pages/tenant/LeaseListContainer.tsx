
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
      
      // Vérifier si l'agence existe
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .select('id, name')
        .eq('id', agencyId)
        .maybeSingle();
        
      if (agencyError) {
        console.error('Error checking agency:', agencyError);
      }
      
      if (!agencyData) {
        console.warn(`Agency not found with ID: ${agencyId}`);
      } else {
        console.log('Agency found:', agencyData);
      }
      
      // Vérifier directement quels baux existent pour cette agence
      const { data: leaseCheck, error: leaseCheckError } = await supabase
        .from('leases')
        .select('id, properties!inner(id, title, agency_id)')
        .eq('properties.agency_id', agencyId);
        
      if (leaseCheckError) {
        console.error('Error checking leases:', leaseCheckError);
      } else {
        console.log(`Direct lease check found ${leaseCheck?.length || 0} leases`);
      }
      
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

        if (error) {
          console.error('Error fetching leases for property:', error);
          throw error;
        }
        
        console.log("Fetched leases for property:", data);
        setLeases(data || []);
      } else if (agencyId) {
        // Récupérer d'abord les propriétés de l'agence
        const { data: properties, error: propError } = await supabase
          .from('properties')
          .select('id')
          .eq('agency_id', agencyId);
          
        if (propError) {
          console.error('Error fetching properties:', propError);
          throw propError;
        }
        
        console.log(`Found ${properties?.length || 0} properties for agency ${agencyId}`);
        
        if (!properties || properties.length === 0) {
          console.log('No properties found for this agency');
          setLeases([]);
          return;
        }
        
        const propertyIds = properties.map(p => p.id);
        console.log('Property IDs:', propertyIds);
        
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
          .in('property_id', propertyIds)
          .order('start_date', { ascending: false });

        if (error) {
          console.error('Error fetching leases for agency:', error);
          throw error;
        }
        
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
