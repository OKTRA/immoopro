
import { supabase } from '@/lib/supabase';
import { GeographicData } from './types';

/**
 * Service responsible for retrieving geographic visitor data
 */
export const geoService = {
  /**
   * Get a breakdown of visitor geographic locations
   */
  async getGeographicData(): Promise<GeographicData[]> {
    try {
      const { data, error } = await supabase
        .from('visit_statistics')
        .select('country');
      
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      const countryCounts: Record<string, number> = {};
      const total = data.length;
      
      data.forEach(visit => {
        const country = visit.country || 'unknown';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      });
      
      return Object.entries(countryCounts).map(([country, count]) => ({
        country,
        count,
        percentage: (count / total) * 100
      }));
    } catch (error) {
      console.error('Failed to get geographic data:', error);
      throw error;
    }
  }
};
