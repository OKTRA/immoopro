import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Tenant, ApartmentLease, ApartmentLeasePayment } from '@/assets/types';

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
 * Get leases for a property
 */
export const getLeasesByPropertyId = async (propertyId: string) => {
  try {
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        tenants:tenant_id (
          first_name,
          last_name
        ),
        properties:property_id (
          title,
          location
        )
      `)
      .eq('property_id', propertyId);

    if (error) throw error;
    return { leases: data, error: null };
  } catch (error: any) {
    console.error(`Error getting leases for property ${propertyId}:`, error);
    return { leases: [], error: error.message };
  }
};

/**
 * Get leases for an agency
 */
export const getLeasesByAgencyId = async (agencyId: string) => {
  try {
    // First get all properties for this agency
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('agency_id', agencyId);

    if (propertiesError) throw propertiesError;
    
    if (!properties || properties.length === 0) {
      return { leases: [], error: null };
    }

    const propertyIds = properties.map(p => p.id);

    // Then get all leases for these properties
    const { data: leases, error: leasesError } = await supabase
      .from('leases')
      .select(`
        *,
        tenants:tenant_id (
          first_name,
          last_name
        ),
        properties:property_id (
          title,
          location
        )
      `)
      .in('property_id', propertyIds);

    if (leasesError) throw leasesError;
    
    return { leases, error: null };
  } catch (error: any) {
    console.error(`Error getting leases for agency ${agencyId}:`, error);
    return { leases: [], error: error.message };
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
 * Get leases by tenant ID
 */
export const getLeasesByTenantId = async (tenantId: string) => {
  try {
    const { data, error } = await supabase
      .from('apartment_leases')
      .select(`
        *,
        apartments:apartment_id (
          id,
          unit_number,
          floor_plan,
          bedrooms,
          bathrooms,
          monthly_rent,
          property_id,
          properties:property_id (
            id,
            title,
            location,
            image_url
          )
        )
      `)
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return { leases: data, error: null };
  } catch (error: any) {
    console.error(`Error getting leases for tenant ${tenantId}:`, error);
    return { leases: [], error: error.message };
  }
};

/**
 * Create a new lease
 */
export const createLease = async (leaseData: Omit<ApartmentLease, 'id'>) => {
  try {
    console.log('Creating lease with data:', leaseData);
    
    // Convert data to match the actual database column names in the leases table
    const dataToInsert = {
      property_id: leaseData.propertyId,
      tenant_id: leaseData.tenantId,
      start_date: leaseData.startDate,
      end_date: leaseData.endDate,
      monthly_rent: leaseData.monthly_rent,
      security_deposit: leaseData.security_deposit,
      status: leaseData.status
    };

    console.log('Data to insert:', dataToInsert);

    const { data, error } = await supabase
      .from('leases')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating lease:', error);
      throw error;
    }
    return { lease: data, error: null };
  } catch (error: any) {
    console.error('Error creating lease:', error);
    return { lease: null, error: error.message };
  }
};

/**
 * Update a lease
 */
export const updateLease = async (id: string, leaseData: Partial<ApartmentLease>) => {
  try {
    const { data, error } = await supabase
      .from('apartment_leases')
      .update(leaseData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { lease: data, error: null };
  } catch (error: any) {
    console.error(`Error updating lease with ID ${id}:`, error);
    return { lease: null, error: error.message };
  }
};

/**
 * Get payments by tenant ID
 */
export const getPaymentsByTenantId = async (
  tenantId: string,
  limit = 10,
  offset = 0
) => {
  try {
    const { data, error, count } = await supabase
      .from('apartment_lease_payments')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('payment_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { payments: data, count, error: null };
  } catch (error: any) {
    console.error(`Error getting payments for tenant ${tenantId}:`, error);
    return { payments: [], count: 0, error: error.message };
  }
};

/**
 * Create a payment
 */
export const createPayment = async (paymentData: Omit<ApartmentLeasePayment, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('apartment_lease_payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) throw error;
    return { payment: data, error: null };
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return { payment: null, error: error.message };
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
