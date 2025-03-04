
import { useState } from 'react';
import { TenantWithLease } from './types';

export function useTenantLeaseDialog() {
  const [selectedLease, setSelectedLease] = useState<any>(null);
  const [isLeaseDialogOpen, setIsLeaseDialogOpen] = useState(false);

  const handleViewLeaseInDialog = (tenant: TenantWithLease) => {
    console.log("Viewing lease for tenant:", tenant);
    
    if (!tenant.lease && tenant.leaseId) {
      // Si nous avons leaseId mais pas d'objet lease, créez un objet lease minimal
      const minimalLease = {
        id: tenant.leaseId,
        tenant_id: tenant.id || '',
        property_id: tenant.propertyId || '',
        start_date: '',
        end_date: '',
        monthly_rent: 0,
        security_deposit: 0,
        status: tenant.leaseStatus || 'active',
        tenant: {
          first_name: tenant.firstName || '',
          last_name: tenant.lastName || ''
        },
        property: {
          title: "Propriété"
        }
      };
      console.log("Created minimal lease object:", minimalLease);
      setSelectedLease(minimalLease);
    } else {
      console.log("Using existing lease object:", tenant.lease);
      setSelectedLease(tenant.lease);
    }
    setIsLeaseDialogOpen(true);
  };

  const closeLease = () => {
    setIsLeaseDialogOpen(false);
  };

  return {
    selectedLease,
    isLeaseDialogOpen,
    handleViewLeaseInDialog,
    closeLease
  };
}
