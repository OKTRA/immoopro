
import { supabase } from '@/lib/supabase';
import { VisitStatistic } from './types';
import { getDeviceType, getBrowserType } from './utils';

/**
 * Service responsible for tracking page views and user visits
 */
export const trackerService = {
  /**
   * Track a page view in the analytics system
   */
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
  }
};
