
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

/**
 * Component that tracks page views silently in the background
 * This should be included in the app's main layout
 */
export function VisitorTracker() {
  const location = useLocation();
  
  useEffect(() => {
    const trackPageView = async () => {
      try {
        // Create or retrieve visitor ID from local storage
        const visitorId = localStorage.getItem('visitor_id') || crypto.randomUUID();
        const sessionId = localStorage.getItem('session_id') || crypto.randomUUID();
        
        // Store IDs in localStorage for future visits
        localStorage.setItem('visitor_id', visitorId);
        localStorage.setItem('session_id', sessionId);
        
        // Track the page view
        const visitorData = {
          visitor_id: visitorId,
          session_id: sessionId,
          page: location.pathname,
          referrer: document.referrer,
          user_agent: navigator.userAgent,
          device_type: getDeviceType(),
          browser: getBrowserType(),
          is_new_user: !localStorage.getItem('returning_visitor')
        };
        
        // Call the Supabase edge function for tracking
        const { error } = await supabase.functions.invoke('track-visit', {
          body: { visitorData }
        });
        
        if (!error) {
          localStorage.setItem('returning_visitor', 'true');
          console.log('Page view tracked successfully');
        } else {
          console.error('Error tracking page view:', error);
        }
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };
    
    // Track page view when location changes
    trackPageView();
    
  }, [location.pathname]);
  
  return null; // This component doesn't render anything
}

// Utility functions
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
