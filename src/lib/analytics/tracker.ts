
import { supabase } from '@/lib/supabase';

let initialized = false;
let currentSessionStart: Date | null = null;
let lastPageUrl: string | null = null;
let lastPageStartTime: Date | null = null;

export const initializeAnalytics = async () => {
  if (initialized) return;
  
  // Check if analytics is enabled in config
  try {
    const { data } = await supabase
      .from('system_config')
      .select('config_value')
      .eq('config_key', 'analytics_enabled')
      .single();
    
    if (!data || !data.config_value) {
      console.log('Analytics is disabled by system configuration');
      return;
    }
  } catch (error) {
    console.error('Error checking analytics config:', error);
    return;
  }
  
  // Generate visitor ID if not exists
  if (!localStorage.getItem('visitor_id')) {
    localStorage.setItem('visitor_id', crypto.randomUUID());
  }
  
  // Generate or refresh session ID
  const lastActivity = localStorage.getItem('last_activity');
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes
  
  if (!lastActivity || (Date.now() - parseInt(lastActivity)) > sessionTimeout) {
    localStorage.setItem('session_id', crypto.randomUUID());
    currentSessionStart = new Date();
  }
  
  localStorage.setItem('last_activity', Date.now().toString());
  
  // Set up page view tracking
  startTracking();
  initialized = true;
  
  console.log('Analytics initialized');
};

const startTracking = () => {
  // Track the initial page view
  trackPageView();
  
  // Listen for navigation/history changes
  window.addEventListener('popstate', () => {
    trackPageExit();
    trackPageView();
  });
  
  // Save data before user leaves the page
  window.addEventListener('beforeunload', () => {
    trackPageExit();
  });
  
  // Update last activity time periodically
  setInterval(() => {
    localStorage.setItem('last_activity', Date.now().toString());
  }, 60000); // every minute
};

export const trackPageView = async () => {
  try {
    const currentUrl = window.location.pathname;
    lastPageUrl = currentUrl;
    lastPageStartTime = new Date();
    
    const visitorId = localStorage.getItem('visitor_id');
    const sessionId = localStorage.getItem('session_id');
    
    if (!visitorId || !sessionId) {
      console.error('Missing visitor or session ID');
      return;
    }
    
    // Call our edge function
    const { error } = await supabase.functions.invoke('track-visit', {
      body: {
        visitorData: {
          visitor_id: visitorId,
          session_id: sessionId,
          page: currentUrl,
          referrer: document.referrer,
          user_agent: navigator.userAgent,
          device_type: getDeviceType(),
          browser: getBrowserType(),
          visit_time: new Date().toISOString(),
          is_new_user: !localStorage.getItem('returning_visitor'),
          is_bounce: true // Will be updated if they visit another page
        }
      }
    });
    
    if (error) {
      console.error('Error tracking page view:', error);
    } else {
      localStorage.setItem('returning_visitor', 'true');
    }
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

export const trackPageExit = async () => {
  if (!lastPageUrl || !lastPageStartTime) return;
  
  try {
    const duration = Math.floor((new Date().getTime() - lastPageStartTime.getTime()) / 1000);
    
    // Minimum duration threshold to filter out noise
    if (duration < 1) return;
    
    const visitorId = localStorage.getItem('visitor_id');
    const sessionId = localStorage.getItem('session_id');
    
    // Update the previous page view with duration and mark as non-bounce
    const { error } = await supabase
      .from('visit_statistics')
      .update({
        duration_seconds: duration,
        is_bounce: false
      })
      .eq('visitor_id', visitorId)
      .eq('session_id', sessionId)
      .eq('page', lastPageUrl)
      .is('duration_seconds', null); // Only update if duration isn't set yet
    
    if (error) {
      console.error('Error updating page exit data:', error);
    }
  } catch (error) {
    console.error('Failed to track page exit:', error);
  }
};

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
