
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LeaseDetailsDialog from '../leases/LeaseDetailsDialog';
import TenantCard from './TenantCard';
import TenantListState from './TenantListState';
import { useTenantLeaseDialog } from './useTenantLeaseDialog';
import { TenantListProps } from './types';

const TenantList: React.FC<TenantListProps> = ({
  tenants,
  loading,
  searchQuery,
  agencyId,
  propertyId,
  handleCreateLease,
  handleAssignTenant,
  handleViewLeaseDetails
}) => {
  const navigate = useNavigate();
  const { 
    selectedLease, 
    isLeaseDialogOpen, 
    isLoading,
    handleViewLeaseInDialog, 
    closeLease 
  } = useTenantLeaseDialog();
  
  // Show loading or empty state if applicable
  if (loading || tenants.length === 0) {
    return (
      <TenantListState 
        loading={loading}
        empty={!loading && tenants.length === 0}
        searchQuery={searchQuery}
        propertyId={propertyId}
      />
    );
  }

  const handleViewProperty = (propertyId: string) => {
    if (!agencyId) return;
    navigate(`/agencies/${agencyId}/properties/${propertyId}`);
  };
  
  const onViewPayments = (leaseId: string) => {
    if (handleViewLeaseDetails) {
      handleViewLeaseDetails(leaseId);
    } else if (agencyId && propertyId) {
      navigate(`/agencies/${agencyId}/properties/${propertyId}/leases/${leaseId}/payments`);
    }
    closeLease();
  };

  return (
    <div className="grid gap-4 mb-6">
      {tenants.map((tenant, index) => (
        <TenantCard
          key={index}
          tenant={tenant}
          agencyId={agencyId}
          propertyId={propertyId}
          handleCreateLease={handleCreateLease}
          handleAssignTenant={handleAssignTenant}
          handleViewLeaseInDialog={handleViewLeaseInDialog}
          handleViewProperty={handleViewProperty}
        />
      ))}

      {/* Dialog pour afficher les détails du bail */}
      <LeaseDetailsDialog
        lease={selectedLease}
        isOpen={isLeaseDialogOpen}
        isLoading={isLoading}
        onClose={closeLease}
        onViewPayments={onViewPayments}
      />
    </div>
  );
};

export default TenantList;
