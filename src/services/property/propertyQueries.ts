
import { supabase } from '@/lib/supabase';
import { Property } from '@/assets/types';
import { formatPropertyFromDb } from './propertyUtils';

// Function to get properties with optional filtering by agency and limit
export const getProperties = async (agencyId?: string, limit?: number) => {
  try {
    let query = supabase
      .from('properties')
      .select(`
        *,
        owner:property_owners(
          id,
          user_id,
          company_name,
          tax_id,
          payment_method,
          payment_percentage
        ),
        agency:agencies(
          id,
          name,
          logo_url,
          email,
          phone,
          website,
          verified
        )
      `);
    
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const properties = data.map(formatPropertyFromDb);
    
    return { properties, error: null };
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    return { properties: [], error: error.message };
  }
};

// Function to get properties with optional filtering by agency and status
export const getPropertiesByAgencyId = async (agencyId: string, status?: string) => {
  try {
    let query = supabase
      .from('properties')
      .select(`
        *,
        owner:property_owners(
          id,
          user_id,
          company_name,
          tax_id,
          payment_method,
          payment_percentage
        ),
        agency:agencies(
          id,
          name,
          logo_url,
          email,
          phone,
          website,
          verified
        )
      `)
      .eq('agency_id', agencyId);
    
    // Si un statut est fourni, filtrer par ce statut
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const properties = data.map(formatPropertyFromDb);
    
    return { properties, error: null };
  } catch (error: any) {
    console.error(`Error fetching properties for agency ${agencyId}:`, error);
    return { properties: [], error: error.message };
  }
};

// Function to get featured properties for homepage
export const getFeaturedProperties = async (limit: number = 6) => {
  return getProperties(undefined, limit);
};

// Function to get popular properties
export const getPopularProperties = async (limit: number = 6) => {
  return getProperties(undefined, limit);
};

// Function to get a specific property by ID
export const getPropertyById = async (propertyId: string) => {
  try {
    // First get the property with its basic information
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:property_owners(
          id,
          user_id,
          company_name,
          tax_id,
          payment_method,
          payment_percentage
        ),
        agency:agencies(
          id,
          name,
          logo_url,
          email,
          phone,
          website,
          verified
        )
      `)
      .eq('id', propertyId)
      .single();
    
    if (error) throw error;
    
    // Check for active leases to ensure status is consistent
    const { data: leases, error: leaseError } = await supabase
      .from('leases')
      .select('id, status')
      .eq('property_id', propertyId)
      .eq('status', 'active');
      
    if (leaseError) {
      console.error('Error checking leases:', leaseError);
    }
    
    // If there are active leases, update the property status to reflect that
    const hasActiveLeases = leases && leases.length > 0;
    
    // Override the status if necessary for UI consistency
    if (hasActiveLeases && data.status === 'available') {
      data.status = 'rented';
    }
    
    const property = formatPropertyFromDb(data);
    
    return { property, error: null, hasActiveLeases };
  } catch (error: any) {
    console.error(`Error fetching property ${propertyId}:`, error);
    return { property: null, error: error.message, hasActiveLeases: false };
  }
};
