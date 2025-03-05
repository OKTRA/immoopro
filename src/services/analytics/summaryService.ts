
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
      
      // Get unique visitors count
      const visitorIds = data.map(visit => visit.visitor_id);
      const uniqueVisitors = [...new Set(visitorIds)].length;
      
      // Get new visitors count
      const newVisitors = data.filter(visit => visit.is_new_user).length;
      
      // Get bounce rate
      const bounces = data.filter(visit => visit.is_bounce).length;
      
      // Get average duration
      const visitsWithDuration = data.filter(visit => visit.duration_seconds);
      const totalDuration = visitsWithDuration.reduce((sum, visit) => sum + visit.duration_seconds, 0);
      const averageDuration = visitsWithDuration.length > 0 ? totalDuration / visitsWithDuration.length : 0;
      
      return {
        total_visitors: uniqueVisitors,
        new_visitors: newVisitors,
        returning_visitors: uniqueVisitors - newVisitors,
        average_duration: averageDuration,
        bounce_rate: data.length > 0 ? (bounces / data.length) * 100 : 0
      };
    } catch (error) {
      console.error('Failed to get visitor summary:', error);
      throw error;
    }
  }
};
