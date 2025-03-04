
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
          title: tenant.propertyId ? "Propriété liée" : "Propriété"
        }
      };
      console.log("Created minimal lease object:", minimalLease);
      setSelectedLease(minimalLease);
    } else if (tenant.lease) {
      console.log("Using existing lease object:", tenant.lease);
      
      // Ensure tenant information is properly formatted
      const enhancedLease = {
        ...tenant.lease,
        tenant: tenant.lease.tenant || {
          first_name: tenant.firstName || '',
          last_name: tenant.lastName || ''
        },
        property: tenant.lease.property || {
          title: tenant.propertyId ? "Propriété liée" : "Propriété"
        }
      };
      
      setSelectedLease(enhancedLease);
    } else {
      // Fallback in case there's no lease data at all
      const fallbackLease = {
        id: 'temporary-id',
        tenant_id: tenant.id || '',
        property_id: tenant.propertyId || '',
        start_date: '',
        end_date: '',
        monthly_rent: 0,
        security_deposit: 0,
        status: 'pending',
        tenant: {
          first_name: tenant.firstName || '',
          last_name: tenant.lastName || ''
        },
        property: {
          title: tenant.propertyId ? "Propriété liée" : "Propriété"
        }
      };
      console.log("Created fallback lease object:", fallbackLease);
      setSelectedLease(fallbackLease);
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
