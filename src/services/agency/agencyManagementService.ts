
import { supabase } from '@/lib/supabase';
import { Agency } from '@/assets/types';
import { transformAgencyData } from './agencyBasicService';

/**
 * Create a new agency
 */
export const createAgency = async (agencyData: Omit<Agency, 'id'>) => {
  try {
    // Get current user ID
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      throw new Error("Utilisateur non authentifié");
    }
    
    console.log('Creating agency with data:', agencyData);
    
    const { data, error } = await supabase
      .from('agencies')
      .insert([{
        name: agencyData.name,
        logo_url: agencyData.logoUrl,
        location: agencyData.location,
        properties_count: agencyData.properties,
        rating: agencyData.rating,
        verified: agencyData.verified,
        description: agencyData.description,
        email: agencyData.email,
        phone: agencyData.phone,
        website: agencyData.website,
        specialties: agencyData.specialties,
        service_areas: agencyData.serviceAreas,
        user_id: userId // Important: lier l'agence à l'utilisateur actuel
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating agency:', error);
      throw error;
    }
    
    const agency = transformAgencyData(data);
    
    return { agency, error: null };
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
    console.log('Updating agency with ID', id, 'and data:', agencyData);
    
    const updateData: any = {};
    if (agencyData.name !== undefined) updateData.name = agencyData.name;
    if (agencyData.logoUrl !== undefined) updateData.logo_url = agencyData.logoUrl;
    if (agencyData.location !== undefined) updateData.location = agencyData.location;
    if (agencyData.properties !== undefined) updateData.properties_count = agencyData.properties;
    if (agencyData.rating !== undefined) updateData.rating = agencyData.rating;
    if (agencyData.verified !== undefined) updateData.verified = agencyData.verified;
    if (agencyData.description !== undefined) updateData.description = agencyData.description;
    if (agencyData.email !== undefined) updateData.email = agencyData.email;
    if (agencyData.phone !== undefined) updateData.phone = agencyData.phone;
    if (agencyData.website !== undefined) updateData.website = agencyData.website;
    if (agencyData.specialties !== undefined) updateData.specialties = agencyData.specialties;
    if (agencyData.serviceAreas !== undefined) updateData.service_areas = agencyData.serviceAreas;

    const { data, error } = await supabase
      .from('agencies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating agency:', error);
      throw error;
    }
    
    const agency = transformAgencyData(data);
    
    return { agency, error: null };
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
