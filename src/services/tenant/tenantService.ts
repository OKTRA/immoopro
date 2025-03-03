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
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { tenant: null, error: error.message };
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
    // First get all tenants
    const { data: allTenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .order('last_name', { ascending: true });

    if (tenantsError) throw tenantsError;

    // Get leases for this property to determine which tenants are assigned
    const { data: leases, error: leasesError } = await supabase
      .from('leases')
      .select('*')
      .eq('property_id', propertyId);

    if (leasesError) throw leasesError;

    // Map tenants with their lease information
    const tenantsWithLeaseInfo = allTenants.map(tenant => {
      // Find if this tenant has a lease for this property
      const tenantLease = leases.find(lease => lease.tenant_id === tenant.id);
      
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
        hasLease: !!tenantLease,
        leaseId: tenantLease?.id,
        leaseStatus: tenantLease?.status
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
    // First get all properties for this agency
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('agency_id', agencyId);

    if (propertiesError) throw propertiesError;
    
    // Get all tenants
    const { data: allTenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .order('last_name', { ascending: true });

    if (tenantsError) throw tenantsError;

    // Get all leases for this agency's properties
    const propertyIds = properties?.map(p => p.id) || [];
    
    let leases = [];
    if (propertyIds.length > 0) {
      const { data: leasesData, error: leasesError } = await supabase
        .from('leases')
        .select('*')
        .in('property_id', propertyIds);

      if (leasesError) throw leasesError;
      leases = leasesData || [];
    }

    // Map tenants with their lease information
    const tenantsWithLeaseInfo = allTenants.map(tenant => {
      // Find if this tenant has a lease for any property in this agency
      const tenantLease = leases.find(lease => lease.tenant_id === tenant.id);
      
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
        hasLease: !!tenantLease,
        leaseId: tenantLease?.id,
        leaseStatus: tenantLease?.status,
        propertyId: tenantLease?.property_id
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
