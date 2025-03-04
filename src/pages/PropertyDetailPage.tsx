
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPropertyById } from "@/services/propertyService";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// Import refactored components
import PropertyDetailHeader from "@/components/properties/PropertyDetailHeader";
import PropertyImageDisplay from "@/components/properties/PropertyImageDisplay";
import PropertyDetailContent from "@/components/properties/PropertyDetailContent";
import PropertyStatusCard from "@/components/properties/PropertyStatusCard";
import PropertyLeaseInfoCard from "@/components/properties/PropertyLeaseInfoCard";

type DisplayStatus = {
  label: string;
  variant: "default" | "destructive" | "secondary" | "success" | "outline";
};

export default function PropertyDetailPage() {
  const { agencyId, propertyId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [leases, setLeases] = useState([]);
  const [isLoadingLeases, setIsLoadingLeases] = useState(true);
  const [displayStatus, setDisplayStatus] = useState<DisplayStatus>({
    label: "Disponible",
    variant: "default"
  });

  const { 
    data: propertyData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getPropertyById(propertyId || ''),
    enabled: !!propertyId
  });

  useEffect(() => {
    const fetchLeases = async () => {
      if (!propertyId) return;
      
      try {
        setIsLoadingLeases(true);
        const { data, error } = await supabase
          .from('leases')
          .select(`
            *,
            tenants:tenant_id (
              id,
              first_name,
              last_name,
              email,
              phone
            )
          `)
          .eq('property_id', propertyId);
        
        if (error) throw error;
        setLeases(data || []);
      } catch (err) {
        console.error('Error fetching leases:', err);
        toast.error("Impossible de charger les baux pour cette propriété");
      } finally {
        setIsLoadingLeases(false);
      }
    };
    
    fetchLeases();
  }, [propertyId]);

  useEffect(() => {
    if (error) {
      toast.error("Impossible de charger les détails de la propriété");
      navigate(`/agencies/${agencyId}`);
    }
  }, [error, navigate, agencyId]);

  useEffect(() => {
    if (propertyData?.property) {
      const activeLeases = leases.filter((lease: any) => lease.status === 'active').length > 0;
      const status = activeLeases ? 'rented' : propertyData.property.status;
      setDisplayStatus(formatPropertyStatus(status));
    }
  }, [propertyData, leases]);

  const property = propertyData?.property;

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

  if (!property) {
    return renderNotFoundState();
  }

  const formatPropertyStatus = (status: string): DisplayStatus => {
    switch (status) {
      case "available":
        return { label: "Disponible", variant: "default" };
      case "sold":
        return { label: "Vendu", variant: "destructive" };
      case "pending":
        return { label: "En attente", variant: "secondary" };
      case "rented":
        return { label: "Loué", variant: "success" };
      case "occupied":
        return { label: "Occupé", variant: "success" };
      default:
        return { label: status, variant: "outline" };
    }
  };

  const statusInfo = displayStatus;
  const hasActiveLeases = leases && leases.filter((lease: any) => lease.status === 'active').length > 0;

  const handleViewPayments = (leaseId: string) => {
    navigate(`/agencies/${agencyId}/properties/${propertyId}/leases/${leaseId}/payments`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <PropertyDetailHeader 
        property={property} 
        agencyId={agencyId} 
        propertyId={propertyId} 
      />

      <PropertyImageDisplay 
        property={property} 
        statusInfo={statusInfo} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <PropertyDetailContent 
          property={property}
          agencyId={agencyId}
          propertyId={propertyId}
          isLoadingLeases={isLoadingLeases}
          hasActiveLeases={hasActiveLeases}
          leases={leases}
          handleViewPayments={handleViewPayments}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="space-y-6">
          <PropertyStatusCard 
            statusInfo={statusInfo}
            hasActiveLeases={hasActiveLeases}
          />
          
          {hasActiveLeases && (
            <PropertyLeaseInfoCard 
              leases={leases}
              agencyId={agencyId}
              propertyId={propertyId}
              handleViewPayments={handleViewPayments}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function renderNotFoundState() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center p-8 max-w-md mx-auto border rounded-lg shadow-sm">
        <div className="mx-auto bg-muted rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Propriété non trouvée</h2>
        <p className="text-muted-foreground mb-6">
          Cette propriété n'existe pas ou a été supprimée
        </p>
        <button 
          onClick={() => navigate(`/agencies/${agencyId}`)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Retour à l'agence
        </button>
      </div>
    </div>
  );
}
