
import { supabase } from '@/lib/supabase';
import { ApartmentLease } from '@/assets/types';

/**
 * Get leases for a property
 */
export const getLeasesByPropertyId = async (propertyId: string) => {
  try {
    // First check if the property belongs to the requesting agency
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('agency_id')
      .eq('id', propertyId)
      .single();

    if (propertyError) throw propertyError;

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
          location,
          agency_id
        )
      `)
      .eq('property_id', propertyId)
      .filter('properties.agency_id', 'eq', property.agency_id);

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
    console.log('Fetching leases for agency:', agencyId);
    
    // First get all properties for this agency
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('agency_id', agencyId);

    if (propertiesError) throw propertiesError;
    
    if (!properties || properties.length === 0) {
      console.log('No properties found for agency:', agencyId);
      return { leases: [], error: null };
    }

    const propertyIds = properties.map(p => p.id);
    console.log('Found properties for agency:', propertyIds);

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
    
    console.log(`Found ${leases?.length || 0} leases for agency properties`);
    
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
    // First check if the tenant belongs to the agency of the current user
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('agency_id')
      .eq('id', tenantId)
      .single();

    if (tenantError) throw tenantError;

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
    
    // Verify that property belongs to current agency
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('agency_id')
      .eq('id', leaseData.propertyId)
      .single();
      
    if (propertyError) throw propertyError;
    
    // Verify that tenant belongs to current agency
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('agency_id')
      .eq('id', leaseData.tenantId)
      .single();
      
    if (tenantError) throw tenantError;
    
    // Ensure the property and tenant belong to the same agency
    if (property.agency_id !== tenant.agency_id) {
      throw new Error("Property and tenant must belong to the same agency");
    }
    
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
    // Verify that the lease belongs to the current agency
    const { data: existingLease, error: leaseError } = await supabase
      .from('apartment_leases')
      .select(`
        id,
        apartment_id,
        apartments:apartment_id (
          property_id,
          properties:property_id (
            agency_id
          )
        )
      `)
      .eq('id', id)
      .single();

    if (leaseError) throw leaseError;

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
