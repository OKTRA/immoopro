import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Tenant } from '@/assets/types';

/**
 * Get all tenants with pagination
 */
export const getAllTenants = async (
  limit = 10,
  offset = 0,
  sortBy = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  try {
    const { data, error, count } = await supabase
      .from('tenants')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { tenants: data, count, error: null };
  } catch (error: any) {
    console.error('Error getting tenants:', error);
    return { tenants: [], count: 0, error: error.message };
  }
};

/**
 * Get a tenant by ID
 */
export const getTenantById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { tenant: data, error: null };
  } catch (error: any) {
    console.error(`Error getting tenant with ID ${id}:`, error);
    return { tenant: null, error: error.message };
  }
};

/**
 * Get tenant by user ID
 */
export const getTenantByUserId = async (userId: string) => {
  try {
    console.log(`Fetching tenant with user ID: ${userId}`);
    
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    
    console.log(`Found tenant for user ID ${userId}:`, data);
    return { tenant: data, error: null };
  } catch (error: any) {
    console.error(`Error getting tenant with user ID ${userId}:`, error);
    return { tenant: null, error: error.message };
  }
};

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

/**
 * Create a new tenant
 */
export const createTenant = async (tenantData: any) => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .insert([tenantData])
      .select()
      .single();

    if (error) throw error;
    return { tenant: data, error: null };
  } catch (error: any) {
    console.error('Error creating tenant:', error);
    return { tenant: null, error: error.message };
  }
};

/**
 * Update a tenant
 */
export const updateTenant = async (id: string, tenantData: Partial<Tenant>) => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .update(tenantData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { tenant: data, error: null };
  } catch (error: any) {
    console.error(`Error updating tenant with ID ${id}:`, error);
    return { tenant: null, error: error.message };
  }
};

/**
 * Delete a tenant
 */
export const deleteTenant = async (id: string) => {
  try {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Error deleting tenant with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get tenant dashboard data
 */
export const getTenantDashboardData = async (tenantId: string) => {
  try {
    // Get active leases
    const { data: leases, error: leasesError } = await supabase
      .from('apartment_leases')
      .select(`
        *,
        apartments:apartment_id (
          id,
          unit_number,
          floor_plan,
          property_id,
          properties:property_id (
            id,
            title,
            location
          )
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (leasesError) throw leasesError;

    // Get recent payments
    const { data: recentPayments, error: paymentsError } = await supabase
      .from('apartment_lease_payments')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('payment_date', { ascending: false })
      .limit(5);

    if (paymentsError) throw paymentsError;

    // Get upcoming payments
    const { data: upcomingPayments, error: upcomingError } = await supabase
      .from('payment_notifications')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('due_date', new Date().toISOString().split('T')[0])
      .order('due_date')
      .limit(5);

    if (upcomingError) throw upcomingError;

    return {
      data: {
        activeLeases: leases,
        recentPayments,
        upcomingPayments
      },
      error: null
    };
  } catch (error: any) {
    console.error('Error getting tenant dashboard data:', error);
    return {
      data: null,
      error: error.message
    };
  }
};
