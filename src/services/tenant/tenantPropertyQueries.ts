
import { supabase } from '@/lib/supabase';

/**
 * Get tenants for a specific property with lease status
 */
export const getTenantsByPropertyId = async (propertyId: string) => {
  try {
    console.log(`Fetching tenants for property: ${propertyId}`);
    
    // Get the property to identify the agency
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('agency_id')
      .eq('id', propertyId)
      .single();

    if (propertyError) throw propertyError;
    
    const agencyId = property?.agency_id;
    
    if (!agencyId) {
      throw new Error('Property does not have an associated agency');
    }
    
    // Get tenants for this agency with more efficient query
    const { data: allTenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*, leases!leases_tenant_id_fkey(id, property_id, status)')
      .eq('agency_id', agencyId)
      .order('last_name', { ascending: true });

    if (tenantsError) throw tenantsError;

    // Log the found data to help debug
    console.log(`Found ${allTenants?.length || 0} tenants for agency ${agencyId}`);
    
    // Map tenants with their lease information for this property
    const tenantsWithLeaseInfo = allTenants.map(tenant => {
      // Find if this tenant has a lease for this property
      const tenantLeases = tenant.leases || [];
      const propertyLease = tenantLeases.find(lease => lease.property_id === propertyId);
      
      return {
        id: tenant.id,
        firstName: tenant.first_name,
        lastName: tenant.last_name,
        email: tenant.email,
        phone: tenant.phone,
        profession: tenant.profession,
        employmentStatus: tenant.employment_status,
        photoUrl: tenant.photo_url,
        emergencyContact: tenant.emergency_contact,
        hasLease: !!propertyLease,
        leaseId: propertyLease?.id,
        leaseStatus: propertyLease?.status,
        propertyId: propertyLease?.property_id || null
      };
    });

    return { tenants: tenantsWithLeaseInfo, error: null };
  } catch (error: any) {
    console.error('Error getting tenants for property:', error);
    return { tenants: [], error: error.message };
  }
};

/**
 * Get all tenants for a specific agency
 */
export const getTenantsByAgencyId = async (agencyId: string) => {
  try {
    console.log(`Fetching tenants for agency: ${agencyId}`);
    
    // Use a more efficient JOIN query to get tenants with their lease information in one go
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select(`
        *,
        leases:leases(
          id,
          property_id,
          status
        )
      `)
      .eq('agency_id', agencyId)
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
    
    console.log(`Found ${tenants?.length || 0} tenants for agency ${agencyId}`);
    
    // Map the API response to the expected format with additional lease info
    const tenantsWithLeaseInfo = tenants.map(tenant => {
      const tenantLeases = tenant.leases || [];
      const hasActiveLease = tenantLeases.some(lease => lease.status === 'active');
      const firstLease = tenantLeases[0] || {};
      
      return {
        id: tenant.id,
        firstName: tenant.first_name,
        lastName: tenant.last_name,
        email: tenant.email,
        phone: tenant.phone,
        profession: tenant.profession,
        employmentStatus: tenant.employment_status,
        photoUrl: tenant.photo_url,
        emergencyContact: tenant.emergency_contact,
        hasLease: tenantLeases.length > 0,
        leaseId: hasActiveLease 
          ? tenantLeases.find(lease => lease.status === 'active')?.id 
          : firstLease?.id,
        leaseStatus: hasActiveLease 
          ? 'active' 
          : (tenantLeases.length > 0 ? firstLease.status : null),
        propertyId: hasActiveLease 
          ? tenantLeases.find(lease => lease.status === 'active')?.property_id 
          : firstLease?.property_id
      };
    });

    return { tenants: tenantsWithLeaseInfo, error: null };
  } catch (error: any) {
    console.error('Error getting tenants for agency:', error);
    return { tenants: [], error: error.message };
  }
};
