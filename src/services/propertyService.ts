
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Property } from '@/assets/types';

// Map Supabase property to our frontend Property type
const mapPropertyFromSupabase = (property: any): Property => ({
  id: property.id,
  title: property.title,
  type: property.type,
  price: property.price,
  location: property.location,
  area: property.area,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  features: property.features || [],
  imageUrl: property.image_url
});

export const getProperties = async (): Promise<{ data: Property[] | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return handleSupabaseError(error);
    }

    return { 
      data: data ? data.map(mapPropertyFromSupabase) : null, 
      error: null 
    };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const getPropertyById = async (id: string): Promise<{ data: Property | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return handleSupabaseError(error);
    }

    return { 
      data: data ? mapPropertyFromSupabase(data) : null, 
      error: null 
    };
  } catch (error) {
    return handleSupabaseError(error);
  }
};

export const searchProperties = async (
  searchParams: {
    location?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
  }
): Promise<{ data: Property[] | null; error: string | null }> => {
  try {
    let query = supabase.from('properties').select('*');
    
    if (searchParams.location) {
      query = query.ilike('location', `%${searchParams.location}%`);
    }
    
    if (searchParams.type) {
      query = query.eq('type', searchParams.type);
    }
    
    if (searchParams.minPrice) {
      query = query.gte('price', searchParams.minPrice);
    }
    
    if (searchParams.maxPrice) {
      query = query.lte('price', searchParams.maxPrice);
    }
    
    if (searchParams.bedrooms) {
      query = query.gte('bedrooms', searchParams.bedrooms);
    }
    
    if (searchParams.bathrooms) {
      query = query.gte('bathrooms', searchParams.bathrooms);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      return handleSupabaseError(error);
    }

    return { 
      data: data ? data.map(mapPropertyFromSupabase) : null, 
      error: null 
    };
  } catch (error) {
    return handleSupabaseError(error);
  }
};
