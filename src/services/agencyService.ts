
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Agency } from '@/assets/types';

// Map Supabase agency to our frontend Agency type
const mapAgencyFromSupabase = (agency: any): Agency => ({
  id: agency.id,
  name: agency.name,
  logoUrl: agency.logo_url,
  location: agency.location,
  properties: agency.properties_count || 0,
  rating: agency.rating || 0,
  verified: agency.verified || false
});

export const getAgencies = async (): Promise<{ data: Agency[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('agencies')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      return handleSupabaseError<Agency[]>(error);
    }

    return { 
      data: data ? data.map(mapAgencyFromSupabase) : null, 
      error: null 
    };
  } catch (error) {
    return handleSupabaseError<Agency[]>(error);
  }
};

export const getAgencyById = async (id: string): Promise<{ data: Agency | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return handleSupabaseError<Agency>(error);
    }

    return { 
      data: data ? mapAgencyFromSupabase(data) : null, 
      error: null 
    };
  } catch (error) {
    return handleSupabaseError<Agency>(error);
  }
};

export const getAgencyProperties = async (agencyId: string): Promise<{ data: any[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return handleSupabaseError<any[]>(error);
    }

    return { data, error: null };
  } catch (error) {
    return handleSupabaseError<any[]>(error);
  }
};
