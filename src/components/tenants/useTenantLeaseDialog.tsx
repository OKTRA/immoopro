
import { useState } from 'react';
import { TenantWithLease } from './types';
import { getLeaseById } from '@/services/tenant/leaseService';
import { toast } from 'sonner';

export function useTenantLeaseDialog() {
  const [selectedLease, setSelectedLease] = useState<any>(null);
  const [isLeaseDialogOpen, setIsLeaseDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleViewLeaseInDialog = async (tenant: TenantWithLease) => {
    console.log("Viewing lease for tenant:", tenant);
    
    if (tenant.leaseId) {
      setIsLoading(true);
      
      try {
        // Fetch complete lease data from the server
        const { lease, error } = await getLeaseById(tenant.leaseId);
        
        if (error) {
          throw new Error(error);
        }
        
        if (lease) {
          console.log("Fetched lease details:", lease);
          setSelectedLease(lease);
        } else {
          // Fallback if API doesn't return lease details
          createFallbackLease(tenant);
        }
      } catch (err) {
        console.error("Error fetching lease details:", err);
        toast.error("Erreur lors de la récupération des détails du bail");
        // Fallback to creating a lease object from tenant data
        createFallbackLease(tenant);
      } finally {
        setIsLoading(false);
      }
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
      createFallbackLease(tenant);
    }
    
    setIsLeaseDialogOpen(true);
  };

  const createFallbackLease = (tenant: TenantWithLease) => {
    const fallbackLease = {
      id: tenant.leaseId || 'temporary-id',
      tenant_id: tenant.id || '',
      property_id: tenant.propertyId || '',
      start_date: '',
      end_date: '',
      monthly_rent: 0,
      security_deposit: 0,
      status: tenant.leaseStatus || 'pending',
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
  };

  const closeLease = () => {
    setIsLeaseDialogOpen(false);
    setSelectedLease(null);
  };

  return {
    selectedLease,
    isLeaseDialogOpen,
    isLoading,
    handleViewLeaseInDialog,
    closeLease
  };
}
