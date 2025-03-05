
import { supabase } from '@/lib/supabase';
import { PageVisits } from './types';

/**
 * Service responsible for retrieving page view statistics
 */
export const pageService = {
  /**
   * Get the top visited pages for a given time period
   */
  async getTopPages(limit: number = 10, dateFrom?: Date, dateTo?: Date): Promise<PageVisits[]> {
    try {
      let query = supabase.from('visit_statistics').select('page, duration_seconds, visitor_id');
      
      if (dateFrom) {
        query = query.gte('visit_time', dateFrom.toISOString());
      }
      
      if (dateTo) {
        query = query.lte('visit_time', dateTo.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      const pageStats: Record<string, { visits: number, durations: number[], visitors: Set<string> }> = {};
      
      data.forEach(visit => {
        if (!pageStats[visit.page]) {
          pageStats[visit.page] = { visits: 0, durations: [], visitors: new Set() };
        }
        
        pageStats[visit.page].visits += 1;
        if (visit.duration_seconds) {
          pageStats[visit.page].durations.push(visit.duration_seconds);
        }
        if (visit.visitor_id) {
          pageStats[visit.page].visitors.add(visit.visitor_id);
        }
      });
      
      const result: PageVisits[] = Object.entries(pageStats).map(([page, stats]) => ({
        page,
        visits: stats.visits,
        unique_visitors: stats.visitors.size,
        average_duration: stats.durations.length > 0 
          ? stats.durations.reduce((sum, duration) => sum + duration, 0) / stats.durations.length 
          : 0
      }));
      
      return result.sort((a, b) => b.visits - a.visits).slice(0, limit);
    } catch (error) {
      console.error('Failed to get top pages:', error);
      throw error;
    }
  }
};
