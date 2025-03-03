
import { supabase, handleSupabaseError, getMockData } from '@/lib/supabase';
import { Agency } from '@/assets/types';

/**
 * Get all agencies with pagination
 */
export const getAllAgencies = async (
  limit = 10,
  offset = 0,
  sortBy = 'properties_count',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  try {
    const { data, error, count } = await supabase
      .from('agencies')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    const transformedData = data?.map(agency => ({
      id: agency.id,
      name: agency.name,
      logoUrl: agency.logo_url,
      location: agency.location,
      properties: agency.properties_count,
      rating: agency.rating,
      verified: agency.verified,
      description: agency.description,
      email: agency.email,
      phone: agency.phone,
      website: agency.website,
      specialties: agency.specialties,
      serviceAreas: agency.service_areas,
    } as Agency));
    
    return { agencies: transformedData, count, error: null };
  } catch (error: any) {
    console.error('Error getting agencies:', error);
    const mockData = getMockData('agencies', limit);
    return { agencies: mockData, count: mockData.length, error: error.message };
  }
};

/**
 * Get an agency by ID
 */
export const getAgencyById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    const agency: Agency = {
      id: data.id,
      name: data.name,
      logoUrl: data.logo_url,
      location: data.location,
      properties: data.properties_count,
      rating: data.rating,
      verified: data.verified,
      description: data.description,
      email: data.email,
      phone: data.phone,
      website: data.website,
      specialties: data.specialties,
      serviceAreas: data.service_areas,
    };
    
    return { agency, error: null };
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
    // Get current user ID
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      throw new Error("Utilisateur non authentifié");
    }
    
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

    if (error) throw error;
    
    const agency: Agency = {
      id: data.id,
      name: data.name,
      logoUrl: data.logo_url,
      location: data.location,
      properties: data.properties_count,
      rating: data.rating,
      verified: data.verified,
      description: data.description,
      email: data.email,
      phone: data.phone,
      website: data.website,
      specialties: data.specialties,
      serviceAreas: data.service_areas,
    };
    
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
    const updateData: any = {};
    if (agencyData.name) updateData.name = agencyData.name;
    if (agencyData.logoUrl) updateData.logo_url = agencyData.logoUrl;
    if (agencyData.location) updateData.location = agencyData.location;
    if (agencyData.properties !== undefined) updateData.properties_count = agencyData.properties;
    if (agencyData.rating !== undefined) updateData.rating = agencyData.rating;
    if (agencyData.verified !== undefined) updateData.verified = agencyData.verified;
    if (agencyData.description) updateData.description = agencyData.description;
    if (agencyData.email) updateData.email = agencyData.email;
    if (agencyData.phone) updateData.phone = agencyData.phone;
    if (agencyData.website) updateData.website = agencyData.website;
    if (agencyData.specialties) updateData.specialties = agencyData.specialties;
    if (agencyData.serviceAreas) updateData.service_areas = agencyData.serviceAreas;

    const { data, error } = await supabase
      .from('agencies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    const agency: Agency = {
      id: data.id,
      name: data.name,
      logoUrl: data.logo_url,
      location: data.location,
      properties: data.properties_count,
      rating: data.rating,
      verified: data.verified,
      description: data.description,
      email: data.email,
      phone: data.phone,
      website: data.website,
      specialties: data.specialties,
      serviceAreas: data.service_areas,
    };
    
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
    
    // Update the agency with the new logo URL
    const { agency, error: updateError } = await updateAgency(agencyId, {
      logoUrl: publicUrl
    });
    
    if (updateError) throw new Error(updateError);
    
    return { logoUrl: publicUrl, agency, error: null };
  } catch (error: any) {
    console.error('Error uploading agency logo:', error);
    return { logoUrl: null, agency: null, error: error.message };
  }
};

/**
 * Get featured agencies
 */
export const getFeaturedAgencies = async (limit = 6) => {
  try {
    // First attempt to fetch from Supabase with verified filter
    try {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      const agencies: Agency[] = data.map(agency => ({
        id: agency.id,
        name: agency.name,
        logoUrl: agency.logo_url,
        location: agency.location,
        properties: agency.properties_count,
        rating: agency.rating,
        verified: agency.verified || false,
        description: agency.description,
        email: agency.email,
        phone: agency.phone,
        website: agency.website,
        specialties: agency.specialties,
        serviceAreas: agency.service_areas,
      }));
      
      return { agencies, error: null };
    } catch (error) {
      // If verified column doesn't exist, try without the filter
      console.warn('Falling back to query without verified filter:', error);
      const { data, error: fallbackError } = await supabase
        .from('agencies')
        .select('*')
        .order('rating', { ascending: false })
        .limit(limit);

      if (fallbackError) throw fallbackError;
      
      const agencies: Agency[] = data.map(agency => ({
        id: agency.id,
        name: agency.name,
        logoUrl: agency.logo_url || '',
        location: agency.location || '',
        properties: agency.properties_count || 0,
        rating: agency.rating || 0,
        verified: false,
        description: agency.description || '',
        email: agency.email || '',
        phone: agency.phone || '',
        website: agency.website || '',
        specialties: agency.specialties || [],
        serviceAreas: agency.service_areas || [],
      }));
      
      return { agencies, error: null };
    }
  } catch (error: any) {
    console.error('Error getting featured agencies:', error);
    const mockData = getMockData('agencies', limit);
    return { agencies: mockData, error: error.message };
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

/**
 * Get agency statistics
 */
export const getAgencyStatistics = async (agencyId: string) => {
  try {
    // Get total properties count
    const { count: propertiesCount, error: propertiesError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId);
      
    if (propertiesError) throw propertiesError;
    
    // Get average property rating
    const { data: propertyRatings, error: ratingsError } = await supabase
      .from('properties')
      .select('rating')
      .eq('agency_id', agencyId);
      
    if (ratingsError) throw ratingsError;
    
    const avgRating = propertyRatings.length > 0
      ? propertyRatings.reduce((sum, p) => sum + (p.rating || 0), 0) / propertyRatings.length
      : 0;
    
    // Get recent listings
    const { data: recentListings, error: listingsError } = await supabase
      .from('properties')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (listingsError) throw listingsError;
    
    return {
      statistics: {
        propertiesCount: propertiesCount || 0,
        avgRating,
        recentListings
      },
      error: null
    };
  } catch (error: any) {
    console.error(`Error getting statistics for agency ${agencyId}:`, error);
    return {
      statistics: {
        propertiesCount: 0,
        avgRating: 0,
        recentListings: []
      },
      error: error.message
    };
  }
};
