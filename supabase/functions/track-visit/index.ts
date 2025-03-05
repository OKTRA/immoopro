
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { visitorData } = await req.json();

    // Validate required fields
    if (!visitorData || !visitorData.visitor_id || !visitorData.page) {
      return new Response(
        JSON.stringify({ error: 'Missing required visitor data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Add IP address if not provided
    if (!visitorData.ip_address) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                 req.headers.get('x-real-ip') || 
                 'unknown';
      visitorData.ip_address = ip;
    }

    // Enhance data with visit time
    const enhancedData = {
      ...visitorData,
      visit_time: new Date().toISOString(),
      is_bounce: true // Will be updated if they visit another page
    };

    // Insert visit data
    const { data, error } = await supabase
      .from('visit_statistics')
      .insert([enhancedData])
      .select();

    if (error) {
      console.error('Error inserting visit data:', error);
      throw error;
    }

    // Try to get geo data for the IP, but don't fail the request if it doesn't work
    try {
      if (visitorData.ip_address && visitorData.ip_address !== 'unknown') {
        const geoResponse = await fetch(`https://ipapi.co/${visitorData.ip_address}/json/`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          
          // Update the record with geo information
          if (geoData.country_name && geoData.city) {
            await supabase
              .from('visit_statistics')
              .update({
                country: geoData.country_name,
                city: geoData.city
              })
              .eq('id', data[0].id);
          }
        }
      }
    } catch (geoError) {
      console.error('Error getting geo data:', geoError);
      // Don't fail the request, just log the error
    }

    // Update previous records from this session to not be bounces
    try {
      if (visitorData.session_id) {
        await supabase
          .from('visit_statistics')
          .update({ is_bounce: false })
          .eq('session_id', visitorData.session_id)
          .neq('id', data[0].id);
      }
    } catch (bounceError) {
      console.error('Error updating bounce status:', bounceError);
      // Don't fail the request, just log the error
    }

    // Calculate and update session duration for previous page if available
    try {
      if (visitorData.session_id) {
        const { data: previousVisits } = await supabase
          .from('visit_statistics')
          .select('*')
          .eq('session_id', visitorData.session_id)
          .order('visit_time', { ascending: false })
          .limit(2);
        
        if (previousVisits && previousVisits.length > 1) {
          const currentVisit = previousVisits[0];
          const previousVisit = previousVisits[1];
          
          const currentTime = new Date(currentVisit.visit_time).getTime();
          const previousTime = new Date(previousVisit.visit_time).getTime();
          
          const durationSeconds = Math.floor((currentTime - previousTime) / 1000);
          
          // Only update if the duration is reasonable (less than 30 minutes)
          if (durationSeconds > 0 && durationSeconds < 1800) {
            await supabase
              .from('visit_statistics')
              .update({ duration_seconds: durationSeconds })
              .eq('id', previousVisit.id);
          }
        }
      }
    } catch (durationError) {
      console.error('Error updating duration:', durationError);
      // Don't fail the request, just log the error
    }

    return new Response(
      JSON.stringify({ success: true, id: data[0].id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error processing visit tracking:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
