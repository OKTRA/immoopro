
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
      // Use the service role client to bypass RLS (this requires proper authentication)
      let query = supabase.from('visit_statistics').select('*');
      
      if (dateFrom) {
        query = query.gte('visit_time', dateFrom.toISOString());
      }
      
      if (dateTo) {
        query = query.lte('visit_time', dateTo.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching visit statistics:', error);
        return createEmptyVisitorSummary();
      }
      
      if (!data || data.length === 0) {
        return createEmptyVisitorSummary();
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
        .map(([name, count]) => ({ name, count }))
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
        .map(([name, count]) => ({ name, count }))
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
      return createEmptyVisitorSummary();
    }
  },

  /**
   * Provides visualization data for visitor trends over time
   */
  async getVisitorTrends(period: 'day' | 'week' | 'month' = 'day', limit: number = 30): Promise<Array<{ date: string, count: number }>> {
    try {
      const { data, error } = await supabase
        .from('visit_statistics')
        .select('visit_time');
      
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      const trendMap: Record<string, number> = {};
      
      data.forEach(visit => {
        const date = new Date(visit.visit_time);
        let key: string;
        
        if (period === 'day') {
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        } else if (period === 'week') {
          // Get the week number
          const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
          const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
          const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
          key = `${date.getFullYear()}-W${weekNumber}`;
        } else {
          key = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-MM
        }
        
        trendMap[key] = (trendMap[key] || 0) + 1;
      });
      
      return Object.entries(trendMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-limit);
    } catch (error) {
      console.error('Failed to get visitor trends:', error);
      return [];
    }
  }
};

// Helper function to create empty visitor summary
function createEmptyVisitorSummary(): VisitorSummary {
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
