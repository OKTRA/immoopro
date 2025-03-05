
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

/**
 * Component that tracks page views silently in the background
 * This should be included in the app's main layout
 */
export function VisitorTracker() {
  const location = useLocation();
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  // Initialize session when component mounts
  useEffect(() => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date());
    }
    
    // Initialize session tracking
    const initSession = async () => {
      // Create or retrieve visitor ID from local storage
      const visitorId = localStorage.getItem('visitor_id') || crypto.randomUUID();
      const sessionId = localStorage.getItem('session_id') || crypto.randomUUID();
      
      // Store IDs in localStorage for future visits
      localStorage.setItem('visitor_id', visitorId);
      localStorage.setItem('session_id', sessionId);
    };
    
    initSession();
    
    // Handle page exit to update bounce rate and duration
    const handleBeforeUnload = async () => {
      if (sessionStartTime) {
        const duration = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000);
        
        // Update the last page view with duration and bounce=false if they visited more than one page
        const visitCount = parseInt(localStorage.getItem('visit_count') || '0');
        
        if (visitCount > 1) {
          try {
            const visitorId = localStorage.getItem('visitor_id');
            const sessionId = localStorage.getItem('session_id');
            
            await supabase.from('visit_statistics')
              .update({
                is_bounce: false,
                duration_seconds: duration
              })
              .eq('visitor_id', visitorId)
              .eq('session_id', sessionId)
              .order('visit_time', { ascending: false })
              .limit(1);
          } catch (error) {
            console.error('Error updating session data:', error);
          }
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionStartTime]);
  
  // Track page view when location changes
  useEffect(() => {
    const trackPageView = async () => {
      try {
        // Create or retrieve visitor ID from local storage
        const visitorId = localStorage.getItem('visitor_id') || crypto.randomUUID();
        const sessionId = localStorage.getItem('session_id') || crypto.randomUUID();
        
        // Store IDs in localStorage for future visits
        localStorage.setItem('visitor_id', visitorId);
        localStorage.setItem('session_id', sessionId);
        
        // Update visit count for this session
        const visitCount = parseInt(localStorage.getItem('visit_count') || '0');
        localStorage.setItem('visit_count', (visitCount + 1).toString());
        
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
          
          // Fallback to direct database insertion if edge function fails
          const { error: insertError } = await supabase.from('visit_statistics').insert({
            visitor_id: visitorId,
            session_id: sessionId,
            page: location.pathname,
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            device_type: getDeviceType(),
            browser: getBrowserType(),
            is_new_user: !localStorage.getItem('returning_visitor'),
            is_bounce: true, // Will be updated on exit if they visit more pages
            visit_time: new Date().toISOString()
          });
          
          if (insertError) {
            console.error('Error with fallback tracking:', insertError);
          } else {
            localStorage.setItem('returning_visitor', 'true');
            console.log('Page view tracked successfully via fallback');
          }
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
