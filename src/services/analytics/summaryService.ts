
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
          bounce_rate: 0,
          popular_devices: [],
          popular_browsers: [],
          visit_trends: []
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
      
      // Calculate device distribution
      const deviceCounts: Record<string, number> = {};
      data.forEach(visit => {
        if (visit.device_type) {
          deviceCounts[visit.device_type] = (deviceCounts[visit.device_type] || 0) + 1;
        }
      });
      
      const popularDevices = Object.entries(deviceCounts)
        .map(([device, count]) => ({ name: device, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      
      // Calculate browser distribution
      const browserCounts: Record<string, number> = {};
      data.forEach(visit => {
        if (visit.browser) {
          browserCounts[visit.browser] = (browserCounts[visit.browser] || 0) + 1;
        }
      });
      
      const popularBrowsers = Object.entries(browserCounts)
        .map(([browser, count]) => ({ name: browser, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      
      // Calculate visit trends (visits by day)
      const visitsByDay: Record<string, number> = {};
      data.forEach(visit => {
        const day = new Date(visit.visit_time).toISOString().split('T')[0];
        visitsByDay[day] = (visitsByDay[day] || 0) + 1;
      });
      
      const visitTrends = Object.entries(visitsByDay)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return {
        total_visitors: uniqueVisitors,
        new_visitors: newVisitors,
        returning_visitors: uniqueVisitors - newVisitors,
        average_duration: averageDuration,
        bounce_rate: data.length > 0 ? (bounces / data.length) * 100 : 0,
        popular_devices: popularDevices,
        popular_browsers: popularBrowsers,
        visit_trends: visitTrends
      };
    } catch (error) {
      console.error('Failed to get visitor summary:', error);
      throw error;
    }
  }
};
