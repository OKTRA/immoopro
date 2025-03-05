
import { supabase } from '@/lib/supabase';
import { VisitorSummary } from './types';

/**
 * Service responsible for retrieving visitor summary data
 */
export const summaryService = {
  /**
   * Get a summary of visitor statistics for a given time period
   */
  async getVisitorSummary(dateFrom?: Date, dateTo?: Date): Promise<VisitorSummary> {
    try {
      let query = supabase.from('visit_statistics').select('*');
      
      if (dateFrom) {
        query = query.gte('visit_time', dateFrom.toISOString());
      }
      
      if (dateTo) {
        query = query.lte('visit_time', dateTo.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          total_visitors: 0,
          new_visitors: 0,
          returning_visitors: 0,
          average_duration: 0,
          bounce_rate: 0
        };
      }
      
      const uniqueVisitors = new Set(data.map(visit => visit.visitor_id)).size;
      const newVisitors = data.filter(visit => visit.is_new_user).length;
      const bounces = data.filter(visit => visit.is_bounce).length;
      const totalDuration = data.reduce((sum, visit) => sum + (visit.duration_seconds || 0), 0);
      
      return {
        total_visitors: uniqueVisitors,
        new_visitors: newVisitors,
        returning_visitors: uniqueVisitors - newVisitors,
        average_duration: data.length > 0 ? totalDuration / data.length : 0,
        bounce_rate: data.length > 0 ? (bounces / data.length) * 100 : 0
      };
    } catch (error) {
      console.error('Failed to get visitor summary:', error);
      throw error;
    }
  }
};
