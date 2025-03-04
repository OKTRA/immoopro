
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPropertyById } from "@/services/propertyService";
import { toast } from "sonner";

// Import refactored components
import PropertyDetailHeader from "@/components/properties/PropertyDetailHeader";
import PropertyImageDisplay from "@/components/properties/PropertyImageDisplay";
import PropertyDetailContent from "@/components/properties/PropertyDetailContent";
import PropertyStatusCard from "@/components/properties/PropertyStatusCard";
import PropertyLeaseInfoCard from "@/components/properties/PropertyLeaseInfoCard";
import PropertyLoadingSkeleton from "@/components/properties/PropertyLoadingSkeleton";
import PropertyNotFound from "@/components/properties/PropertyNotFound";
import PropertyMainActions from "@/components/properties/PropertyMainActions";

// Import custom hook
import { usePropertyLeases } from "@/hooks/usePropertyLeases";

export default function PropertyDetailPage() {
  const { agencyId, propertyId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [displayStatus, setDisplayStatus] = useState({
    label: "Disponible",
    variant: "default" as "default" | "destructive" | "secondary" | "success" | "outline"
  });

  // Use the custom hook to fetch and manage leases
  const { 
    leases, 
    isLoadingLeases, 
    hasActiveLeases, 
    activeLeaseId,
    formatPropertyStatus 
  } = usePropertyLeases(propertyId);

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
  }, [propertyData, leases, formatPropertyStatus]);

  const property = propertyData?.property;

  const handleViewPayments = (leaseId: string) => {
    navigate(`/agencies/${agencyId}/properties/${propertyId}/leases/${leaseId}/payments`);
  };

  if (isLoading) {
    return <PropertyLoadingSkeleton />;
  }

  if (!property) {
    return <PropertyNotFound />;
  }

  const statusInfo = displayStatus;

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

      <PropertyMainActions 
        hasActiveLeases={hasActiveLeases} 
        activeLeaseId={activeLeaseId} 
        handleViewPayments={handleViewPayments} 
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
            propertyId={propertyId}
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
