
import { supabase, handleSupabaseError, isSupabaseConnected, getMockData } from '@/lib/supabase';
import { Property, PropertyOwner } from '@/assets/types';

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

/**
 * Upload a property image
 */
export const uploadPropertyImage = async (propertyId: string, imageFile: File) => {
  try {
    // Check if Supabase is connected
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Return mock URL if not connected
      return { imageUrl: URL.createObjectURL(imageFile), error: null };
    }
    
    // Create a unique filename
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${propertyId}-${Date.now()}.${fileExt}`;
    const filePath = `properties/${fileName}`;
    
    // Check if storage bucket exists, create it if not
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'properties');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('properties', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
      }
    } catch (err) {
      console.warn('Error checking/creating bucket:', err);
    }
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('properties')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data } = supabase.storage
      .from('properties')
      .getPublicUrl(filePath);
    
    return { imageUrl: data.publicUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading property image:', error);
    return { imageUrl: null, error: error.message };
  }
};

/**
 * Get property owners
 */
export const getPropertyOwners = async () => {
  try {
    // Check if Supabase is connected
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Return mock data if not connected
      const mockOwners: PropertyOwner[] = [
        { 
          id: 'mock-owner-1', 
          name: 'John Smith', 
          email: 'john.smith@example.com', 
          properties: 3,
          userId: 'user-1',
          companyName: null 
        },
        { 
          id: 'mock-owner-2', 
          name: 'Property Manager', 
          email: 'manager@abcproperties.com', 
          properties: 7,
          userId: 'user-2',
          companyName: 'ABC Properties' 
        },
        { 
          id: 'mock-owner-3', 
          name: 'Marie Dupont', 
          email: 'marie.dupont@example.com', 
          properties: 2,
          userId: 'user-3',
          companyName: null 
        },
      ];
      return { owners: mockOwners, error: null };
    }
    
    const { data, error } = await supabase
      .from('property_owners')
      .select(`
        id,
        user_id,
        company_name,
        profiles:user_id (
          first_name,
          last_name,
          email
        )
      `);

    if (error) throw error;
    
    // Transform the data to a more usable format
    const owners: PropertyOwner[] = data.map(owner => {
      const profile = owner.profiles || {};
      const firstName = profile.first_name || '';
      const lastName = profile.last_name || '';
      return {
        id: owner.id,
        userId: owner.user_id,
        companyName: owner.company_name,
        name: firstName && lastName ? `${firstName} ${lastName}`.trim() : owner.company_name || 'Unknown Owner',
        email: profile.email || 'no-email@example.com',
        properties: 0, // Default value, would need another query to get actual count
        // Optional fields from the interface can be undefined
      };
    });
    
    return { owners, error: null };
  } catch (error: any) {
    console.error('Error getting property owners:', error);
    return { owners: [], error: error.message };
  }
};
