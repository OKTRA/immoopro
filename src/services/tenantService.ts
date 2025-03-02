
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
 * Create a new tenant
 */
export const createTenant = async (tenantData: Omit<Tenant, 'id'>) => {
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
    const { data, error } = await supabase
      .from('apartment_leases')
      .insert([leaseData])
      .select()
      .single();

    if (error) throw error;
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
