
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const CINETPAY_SITE_ID = Deno.env.get('CINETPAY_SITE_ID');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("CinetPay webhook endpoint called");
    
    // Get form data or JSON data from request
    let webhookData;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      webhookData = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      webhookData = {};
      for (const [key, value] of formData.entries()) {
        webhookData[key] = value;
      }
    } else {
      console.error("Unsupported content type:", contentType);
      return new Response(JSON.stringify({ error: 'Unsupported content type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log("Webhook data received:", JSON.stringify(webhookData));
    
    // Extract transaction details
    const { 
      cpm_trans_id, 
      cpm_site_id, 
      cpm_amount, 
      cpm_currency, 
      cpm_payment_date, 
      cpm_payment_time, 
      cpm_error_message, 
      cpm_payment_method, 
      cpm_phone_prefixe, 
      cpm_phone_num, 
      cpm_result, 
      cpm_trans_status,
      payment_method
    } = webhookData;

    // Verify required parameters
    if (!cpm_trans_id || !cpm_site_id) {
      console.error("Missing required parameters in webhook data");
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify site ID matches our site ID
    if (cpm_site_id !== CINETPAY_SITE_ID) {
      console.error(`Site ID mismatch: ${cpm_site_id} vs ${CINETPAY_SITE_ID}`);
      return new Response(JSON.stringify({ error: 'Invalid site ID' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if payment was successful
    const isSuccessful = cpm_result === '00' && cpm_trans_status === 'ACCEPTED';
    
    // Create database client from URL
    console.log(`Payment status: ${isSuccessful ? 'SUCCESSFUL' : 'FAILED'}`);
    console.log(`Transaction ID: ${cpm_trans_id}`);
    console.log(`Amount: ${cpm_amount} ${cpm_currency}`);
    console.log(`Payment method: ${cpm_payment_method || payment_method}`);

    // Get Supabase URL and key from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the payment record by transaction ID
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', cpm_trans_id)
      .single();
    
    if (fetchError) {
      console.error('Error finding payment record:', fetchError);
      return new Response(JSON.stringify({ error: 'Payment record not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Update payment status in database
    const paymentUpdate = {
      status: isSuccessful ? 'paid' : 'failed',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: cpm_payment_method || payment_method || payment.payment_method,
      notes: payment.notes 
        ? `${payment.notes}; ${isSuccessful ? 'Paiement CinetPay réussi' : 'Échec du paiement CinetPay: ' + cpm_error_message}`
        : (isSuccessful ? 'Paiement CinetPay réussi' : 'Échec du paiement CinetPay: ' + cpm_error_message)
    };
    
    const { error: updateError } = await supabase
      .from('payments')
      .update(paymentUpdate)
      .eq('id', payment.id);
    
    if (updateError) {
      console.error('Error updating payment record:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update payment' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Successfully updated payment ${payment.id} to status: ${paymentUpdate.status}`);
    
    // Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Webhook processed successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error processing CinetPay webhook:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
