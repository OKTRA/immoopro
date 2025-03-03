import { supabase, handleSupabaseError, isSupabaseConnected, getMockData } from '@/lib/supabase';
import { Property } from '@/assets/types';

/**
 * Get featured properties
 */
export const getFeaturedProperties = async (limit = 6) => {
  try {
    // Check if Supabase is connected
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Return mock data if not connected
      return { properties: getMockData('properties', limit), error: null };
    }
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return { properties: data, error: null };
  } catch (error: any) {
    console.error('Error getting featured properties:', error);
    return { properties: getMockData('properties', limit), error: error.message };
  }
};

/**
 * Get popular properties
 */
export const getPopularProperties = async (limit = 4) => {
  try {
    // Check if Supabase is connected
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Return mock data if not connected
      return { properties: getMockData('properties', limit), error: null };
    }
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return { properties: data, error: null };
  } catch (error: any) {
    console.error('Error getting popular properties:', error);
    return { properties: getMockData('properties', limit), error: error.message };
  }
};

/**
 * Get a property by ID
 */
export const getPropertyById = async (id: string) => {
  try {
    // Check if Supabase is connected
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Return mock data if not connected
      const mockProperties = getMockData('properties', 10);
      const property = mockProperties.find((p: any) => p.id === id) || mockProperties[0];
      return { property, error: null };
    }
    
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *, 
        agencies:agency_id (
          id, 
          name, 
          logo_url, 
          location
        ),
        property_owners:owner_id (
          id, 
          user_id,
          company_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { property: data, error: null };
  } catch (error: any) {
    console.error(`Error getting property with ID ${id}:`, error);
    // Return mock data on error as fallback
    const mockProperties = getMockData('properties', 10);
    const property = mockProperties.find((p: any) => p.id === id) || mockProperties[0];
    return { property, error: error.message };
  }
};

/**
 * Get properties by agency ID
 */
export const getPropertiesByAgencyId = async (agencyId: string) => {
  try {
    // Check if Supabase is connected
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Return mock data if not connected
      return { properties: getMockData('properties', 8), error: null };
    }
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('agency_id', agencyId);

    if (error) throw error;
    return { properties: data, error: null };
  } catch (error: any) {
    console.error(`Error getting properties for agency ${agencyId}:`, error);
    return { properties: getMockData('properties', 8), error: error.message };
  }
};

/**
 * Create a new property
 */
export const createProperty = async (propertyData: Omit<Property, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([propertyData])
      .select()
      .single();

    if (error) throw error;
    return { property: data, error: null };
  } catch (error: any) {
    console.error('Error creating property:', error);
    return { property: null, error: error.message };
  }
};

/**
 * Update a property
 */
export const updateProperty = async (id: string, propertyData: Partial<Property>) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { property: data, error: null };
  } catch (error: any) {
    console.error(`Error updating property with ID ${id}:`, error);
    return { property: null, error: error.message };
  }
};

/**
 * Delete a property
 */
export const deleteProperty = async (id: string) => {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Error deleting property with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get property lease information
 */
export const getPropertyLeaseInfo = async (propertyId: string) => {
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
          phone
        )
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If no lease is found, return null without throwing an error
      if (error.code === 'PGRST116') {
        return { lease: null, error: null };
      }
      throw error;
    }
    
    return { lease: data, error: null };
  } catch (error: any) {
    console.error(`Error getting lease for property ${propertyId}:`, error);
    return { lease: null, error: error.message };
  }
};
