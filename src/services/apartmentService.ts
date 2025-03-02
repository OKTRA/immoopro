
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Apartment } from '@/assets/types';

/**
 * Get all apartments with pagination and filtering
 */
export const getAllApartments = async (
  filters?: {
    propertyId?: string;
    minRent?: number;
    maxRent?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    status?: string;
  },
  limit = 10,
  offset = 0,
  sortBy = 'monthly_rent',
  sortOrder: 'asc' | 'desc' = 'asc'
) => {
  try {
    let query = supabase
      .from('apartments')
      .select('*, properties:property_id (*)', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (filters) {
      if (filters.propertyId) {
        query = query.eq('property_id', filters.propertyId);
      }
      
      if (filters.minRent !== undefined) {
        query = query.gte('monthly_rent', filters.minRent);
      }
      
      if (filters.maxRent !== undefined) {
        query = query.lte('monthly_rent', filters.maxRent);
      }
      
      if (filters.minBedrooms !== undefined) {
        query = query.gte('bedrooms', filters.minBedrooms);
      }
      
      if (filters.maxBedrooms !== undefined) {
        query = query.lte('bedrooms', filters.maxBedrooms);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { apartments: data, count, error: null };
  } catch (error: any) {
    console.error('Error getting apartments:', error);
    return { apartments: [], count: 0, error: error.message };
  }
};

/**
 * Get an apartment by ID
 */
export const getApartmentById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('apartments')
      .select('*, properties:property_id (*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { apartment: data, error: null };
  } catch (error: any) {
    console.error(`Error getting apartment with ID ${id}:`, error);
    return { apartment: null, error: error.message };
  }
};

/**
 * Get apartments by property ID
 */
export const getApartmentsByPropertyId = async (
  propertyId: string,
  limit = 100,
  offset = 0
) => {
  try {
    const { data, error, count } = await supabase
      .from('apartments')
      .select('*', { count: 'exact' })
      .eq('property_id', propertyId)
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { apartments: data, count, error: null };
  } catch (error: any) {
    console.error(`Error getting apartments for property ${propertyId}:`, error);
    return { apartments: [], count: 0, error: error.message };
  }
};

/**
 * Create a new apartment
 */
export const createApartment = async (apartmentData: Omit<Apartment, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('apartments')
      .insert([apartmentData])
      .select()
      .single();

    if (error) throw error;
    return { apartment: data, error: null };
  } catch (error: any) {
    console.error('Error creating apartment:', error);
    return { apartment: null, error: error.message };
  }
};

/**
 * Update an apartment
 */
export const updateApartment = async (id: string, apartmentData: Partial<Apartment>) => {
  try {
    const { data, error } = await supabase
      .from('apartments')
      .update(apartmentData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { apartment: data, error: null };
  } catch (error: any) {
    console.error(`Error updating apartment with ID ${id}:`, error);
    return { apartment: null, error: error.message };
  }
};

/**
 * Delete an apartment
 */
export const deleteApartment = async (id: string) => {
  try {
    const { error } = await supabase
      .from('apartments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Error deleting apartment with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload apartment image
 */
export const uploadApartmentImage = async (apartmentId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${apartmentId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `apartments/${fileName}`;
    
    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('apartments')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('apartments')
      .getPublicUrl(filePath);
    
    return { imageUrl: publicUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading apartment image:', error);
    return { imageUrl: null, error: error.message };
  }
};

/**
 * Get available apartments
 */
export const getAvailableApartments = async (
  limit = 10,
  offset = 0
) => {
  try {
    const { data, error, count } = await supabase
      .from('apartments')
      .select('*, properties:property_id (*)', { count: 'exact' })
      .eq('status', 'available')
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { apartments: data, count, error: null };
  } catch (error: any) {
    console.error('Error getting available apartments:', error);
    return { apartments: [], count: 0, error: error.message };
  }
};

/**
 * Get apartment leases
 */
export const getApartmentLeases = async (apartmentId: string) => {
  try {
    const { data, error } = await supabase
      .from('apartment_leases')
      .select(`
        *,
        tenants:tenant_id (*)
      `)
      .eq('apartment_id', apartmentId);

    if (error) throw error;
    return { leases: data, error: null };
  } catch (error: any) {
    console.error(`Error getting leases for apartment ${apartmentId}:`, error);
    return { leases: [], error: error.message };
  }
};
