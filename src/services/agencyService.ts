
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Agency } from '@/assets/types';

/**
 * Get all agencies with pagination
 */
export const getAllAgencies = async (
  limit = 10,
  offset = 0,
  sortBy = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  try {
    const { data, error, count } = await supabase
      .from('agencies')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { agencies: data, count, error: null };
  } catch (error: any) {
    console.error('Error getting agencies:', error);
    return { agencies: [], count: 0, error: error.message };
  }
};

/**
 * Get a single agency by ID
 */
export const getAgencyById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { agency: data, error: null };
  } catch (error: any) {
    console.error(`Error getting agency with ID ${id}:`, error);
    return { agency: null, error: error.message };
  }
};

/**
 * Create a new agency
 */
export const createAgency = async (agencyData: Omit<Agency, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('agencies')
      .insert([agencyData])
      .select()
      .single();

    if (error) throw error;
    return { agency: data, error: null };
  } catch (error: any) {
    console.error('Error creating agency:', error);
    return { agency: null, error: error.message };
  }
};

/**
 * Update an existing agency
 */
export const updateAgency = async (id: string, agencyData: Partial<Agency>) => {
  try {
    const { data, error } = await supabase
      .from('agencies')
      .update(agencyData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { agency: data, error: null };
  } catch (error: any) {
    console.error(`Error updating agency with ID ${id}:`, error);
    return { agency: null, error: error.message };
  }
};

/**
 * Delete an agency
 */
export const deleteAgency = async (id: string) => {
  try {
    const { error } = await supabase
      .from('agencies')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Error deleting agency with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload agency logo
 */
export const uploadAgencyLogo = async (agencyId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${agencyId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `agencies/${fileName}`;
    
    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('agencies')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('agencies')
      .getPublicUrl(filePath);
    
    return { logoUrl: publicUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading agency logo:', error);
    return { logoUrl: null, error: error.message };
  }
};

/**
 * Get featured agencies
 */
export const getFeaturedAgencies = async (limit = 4) => {
  try {
    const { data, error } = await supabase
      .from('agencies')
      .select('*')
      .eq('verified', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { agencies: data, error: null };
  } catch (error: any) {
    console.error('Error getting featured agencies:', error);
    return { agencies: [], error: error.message };
  }
};

/**
 * Get properties by agency ID
 */
export const getPropertiesByAgencyId = async (
  agencyId: string,
  limit = 10,
  offset = 0
) => {
  try {
    const { data, error, count } = await supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('agency_id', agencyId)
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { properties: data, count, error: null };
  } catch (error: any) {
    console.error(`Error getting properties for agency ${agencyId}:`, error);
    return { properties: [], count: 0, error: error.message };
  }
};
