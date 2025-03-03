
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
          first_name,
          last_name,
          email,
          phone
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
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:property_owners(
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('id', propertyId)
      .single();
    
    if (error) throw error;
    
    const property = formatPropertyFromDb(data);
    
    return { property, error: null };
  } catch (error: any) {
    console.error(`Error fetching property ${propertyId}:`, error);
    return { property: null, error: error.message };
  }
};
