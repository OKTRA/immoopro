
import { supabase } from '@/lib/supabase';

export interface VisitStatistic {
  id: string;
  visitor_id: string;
  session_id: string;
  page: string;
  referrer?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  country?: string;
  city?: string;
  visit_time: Date;
  duration_seconds?: number;
  is_bounce: boolean;
  is_new_user: boolean;
}

export interface VisitorSummary {
  total_visitors: number;
  new_visitors: number;
  returning_visitors: number;
  average_duration: number;
  bounce_rate: number;
}

export interface PageVisits {
  page: string;
  visits: number;
  unique_visitors: number;
  average_duration: number;
}

export interface DeviceBreakdown {
  device_type: string;
  count: number;
  percentage: number;
}

export interface GeographicData {
  country: string;
  count: number;
  percentage: number;
}

export const visitorAnalyticsService = {
  async trackPageView(pageData: Partial<VisitStatistic>): Promise<void> {
    try {
      const visitorId = localStorage.getItem('visitor_id') || crypto.randomUUID();
      const sessionId = localStorage.getItem('session_id') || crypto.randomUUID();
      
      localStorage.setItem('visitor_id', visitorId);
      localStorage.setItem('session_id', sessionId);
      
      const { error } = await supabase.from('visit_statistics').insert({
        visitor_id: visitorId,
        session_id: sessionId,
        page: pageData.page || window.location.pathname,
        referrer: pageData.referrer || document.referrer,
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
        browser: getBrowserType(),
        is_new_user: !localStorage.getItem('returning_visitor'),
        is_bounce: true // Will be updated if they visit another page
      });
      
      if (!error) {
        localStorage.setItem('returning_visitor', 'true');
      } else {
        console.error('Error tracking page view:', error);
      }
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  },
  
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
  },
  
  async getTopPages(limit: number = 10, dateFrom?: Date, dateTo?: Date): Promise<PageVisits[]> {
    try {
      let query = supabase.from('visit_statistics').select('page, duration_seconds');
      
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
        pageStats[visit.page].visitors.add(visit.visitor_id);
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
  },
  
  async getDeviceBreakdown(): Promise<DeviceBreakdown[]> {
    try {
      const { data, error } = await supabase
        .from('visit_statistics')
        .select('device_type');
      
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      const deviceCounts: Record<string, number> = {};
      const total = data.length;
      
      data.forEach(visit => {
        const deviceType = visit.device_type || 'unknown';
        deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
      });
      
      return Object.entries(deviceCounts).map(([device_type, count]) => ({
        device_type,
        count,
        percentage: (count / total) * 100
      }));
    } catch (error) {
      console.error('Failed to get device breakdown:', error);
      throw error;
    }
  },
  
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

// Helper functions
function getDeviceType(): string {
  const userAgent = navigator.userAgent;
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    return 'tablet';
  }
  
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    return 'mobile';
  }
  
  return 'desktop';
}

function getBrowserType(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.indexOf('Firefox') > -1) {
    return 'Firefox';
  } else if (userAgent.indexOf('SamsungBrowser') > -1) {
    return 'Samsung';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    return 'Opera';
  } else if (userAgent.indexOf('Trident') > -1) {
    return 'Internet Explorer';
  } else if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  } else if (userAgent.indexOf('Chrome') > -1) {
    return 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    return 'Safari';
  } else {
    return 'Unknown';
  }
}
