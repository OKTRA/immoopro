import { supabase, handleSupabaseError, getMockData } from '@/lib/supabase';
import { Property } from '@/assets/types';

/**
 * Get all properties with filters
 */
export const getAllProperties = async (
  filters?: {
    type?: string[];
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    location?: string;
    status?: string;
  },
  limit = 10,
  offset = 0,
  sortBy = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  try {
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (filters) {
      if (filters.type && filters.type.length > 0) {
        query = query.in('type', filters.type);
      }
      
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }
      
      if (filters.minBedrooms !== undefined) {
        query = query.gte('bedrooms', filters.minBedrooms);
      }
      
      if (filters.maxBedrooms !== undefined) {
        query = query.lte('bedrooms', filters.maxBedrooms);
      }
      
      if (filters.minBathrooms !== undefined) {
        query = query.gte('bathrooms', filters.minBathrooms);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
    }

    const { data, error, count } = await query;

    if (error) throw error;
    
    // Transform data to match our frontend model
    const transformedData = data?.map(property => ({
      id: property.id,
      title: property.title,
      type: property.type as 'apartment' | 'house' | 'office' | 'land',
      price: property.price,
      location: property.location || property.address,
      area: property.area || 0,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      features: property.features || [],
      imageUrl: property.image_url || 'https://placehold.co/600x400?text=No+Image',
      description: property.description || '',
      status: property.status || 'available',
      agencyId: property.agency_id || undefined,
      yearBuilt: property.year_built,
      furnished: property.furnished,
      petsAllowed: property.pets_allowed,
      latitude: property.latitude,
      longitude: property.longitude,
      virtualTourUrl: property.virtual_tour_url,
    } as Property));
    
    return { properties: transformedData, count, error: null };
  } catch (error: any) {
    console.error('Error getting properties:', error);
    // Fall back to mock data
    const mockData = getMockData('properties', limit);
    return { properties: mockData, count: mockData.length, error: error.message };
  }
};

/**
 * Get a single property by ID
 */
export const getPropertyById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { property: data, error: null };
  } catch (error: any) {
    console.error(`Error getting property with ID ${id}:`, error);
    return { property: null, error: error.message };
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
 * Update an existing property
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
 * Upload property image
 */
export const uploadPropertyImage = async (propertyId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `properties/${fileName}`;
    
    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('properties')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('properties')
      .getPublicUrl(filePath);
    
    return { imageUrl: publicUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading property image:', error);
    return { imageUrl: null, error: error.message };
  }
};

/**
 * Get featured properties
 */
export const getFeaturedProperties = async (limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Transform data to match our frontend model
    const transformedData = data?.map(property => ({
      id: property.id,
      title: property.title,
      type: property.type as 'apartment' | 'house' | 'office' | 'land',
      price: property.price,
      location: property.location || property.address,
      area: property.area || 0,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      features: property.features || [],
      imageUrl: property.image_url || 'https://placehold.co/600x400?text=No+Image',
      description: property.description || '',
      status: property.status || 'available',
      agencyId: property.agency_id || undefined,
      yearBuilt: property.year_built,
      furnished: property.furnished,
      petsAllowed: property.pets_allowed,
      latitude: property.latitude,
      longitude: property.longitude,
      virtualTourUrl: property.virtual_tour_url,
    } as Property));

    return { properties: transformedData, error: null };
  } catch (error: any) {
    console.error('Error getting featured properties:', error);
    // Fall back to mock data
    const mockData = getMockData('properties', limit);
    return { properties: mockData, error: error.message };
  }
};

/**
 * Search properties by keyword
 */
export const searchProperties = async (keyword: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .or(`title.ilike.%${keyword}%,location.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .limit(limit);

    if (error) throw error;
    return { properties: data, error: null };
  } catch (error: any) {
    console.error('Error searching properties:', error);
    return { properties: [], error: error.message };
  }
};
