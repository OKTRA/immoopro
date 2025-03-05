
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

    // Insert visit data
    const { data, error } = await supabase
      .from('visit_statistics')
      .insert([visitorData])
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
