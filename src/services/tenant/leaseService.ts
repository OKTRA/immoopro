import { supabase } from '@/lib/supabase';
import { ApartmentLease } from '@/assets/types';

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
 * Get lease by ID
 */
export const getLeaseById = async (leaseId: string) => {
  try {
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        tenants:tenant_id (
          id,
          first_name,
          last_name,
          email,
          phone,
          photo_url,
          profession
        ),
        properties:property_id (
          id,
          title,
          location,
          image_url,
          type
        )
      `)
      .eq('id', leaseId)
      .single();

    if (error) throw error;
    return { lease: data, error: null };
  } catch (error: any) {
    console.error(`Error getting lease with ID ${leaseId}:`, error);
    return { lease: null, error: error.message };
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
      payment_start_date: leaseData.paymentStartDate, 
      monthly_rent: leaseData.monthly_rent,
      security_deposit: leaseData.security_deposit,
      payment_day: leaseData.payment_day,
      payment_frequency: leaseData.payment_frequency,
      is_active: leaseData.is_active,
      signed_by_tenant: leaseData.signed_by_tenant,
      signed_by_owner: leaseData.signed_by_owner,
      has_renewal_option: leaseData.has_renewal_option,
      lease_type: leaseData.lease_type,
      special_conditions: leaseData.special_conditions,
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
    // Convert camelCase to snake_case for database column names
    const updateData: any = {};
    
    if (leaseData.propertyId !== undefined) updateData.property_id = leaseData.propertyId;
    if (leaseData.tenantId !== undefined) updateData.tenant_id = leaseData.tenantId;
    if (leaseData.startDate !== undefined) updateData.start_date = leaseData.startDate;
    if (leaseData.endDate !== undefined) updateData.end_date = leaseData.endDate;
    if (leaseData.paymentStartDate !== undefined) updateData.payment_start_date = leaseData.paymentStartDate;
    if (leaseData.monthly_rent !== undefined) updateData.monthly_rent = leaseData.monthly_rent;
    if (leaseData.security_deposit !== undefined) updateData.security_deposit = leaseData.security_deposit;
    if (leaseData.payment_day !== undefined) updateData.payment_day = leaseData.payment_day;
    if (leaseData.payment_frequency !== undefined) updateData.payment_frequency = leaseData.payment_frequency;
    if (leaseData.is_active !== undefined) updateData.is_active = leaseData.is_active;
    if (leaseData.signed_by_tenant !== undefined) updateData.signed_by_tenant = leaseData.signed_by_tenant;
    if (leaseData.signed_by_owner !== undefined) updateData.signed_by_owner = leaseData.signed_by_owner;
    if (leaseData.has_renewal_option !== undefined) updateData.has_renewal_option = leaseData.has_renewal_option;
    if (leaseData.lease_type !== undefined) updateData.lease_type = leaseData.lease_type;
    if (leaseData.special_conditions !== undefined) updateData.special_conditions = leaseData.special_conditions;
    if (leaseData.status !== undefined) updateData.status = leaseData.status;
    
    console.log('Updating lease with ID', id, 'and data:', updateData);

    const { data, error } = await supabase
      .from('leases')  // Changed from apartment_leases to leases
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lease:', error);
      throw error;
    }
    
    return { lease: data, error: null };
  } catch (error: any) {
    console.error(`Error updating lease with ID ${id}:`, error);
    return { lease: null, error: error.message };
  }
};
