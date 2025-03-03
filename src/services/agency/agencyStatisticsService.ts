
import { supabase } from '@/lib/supabase';

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
