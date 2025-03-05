
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const CINETPAY_API_KEY = Deno.env.get('CINETPAY_API_KEY');
const CINETPAY_SITE_ID = Deno.env.get('CINETPAY_SITE_ID');
const CINETPAY_API_URL = "https://api-checkout.cinetpay.com/v2/payment";
const CINETPAY_CHECK_URL = "https://api-checkout.cinetpay.com/v2/payment/check";

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
    const requestData = await req.json();
    const { action } = requestData;

    console.log(`Processing CinetPay request with action: ${action}`);

    // Initialize payment
    if (action === 'init') {
      const { 
        amount, 
        currency = "XOF", 
        description, 
        transactionId, 
        returnUrl, 
        cancelUrl, 
        paymentData 
      } = requestData;

      console.log(`Initializing payment for transaction ${transactionId}, amount: ${amount}`);

      const payload = {
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: transactionId,
        amount: amount,
        currency: currency,
        description: description,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        channels: "ALL",
        notify_url: new URL(req.url).origin + "/cinetpay-webhook",
        customer_name: paymentData?.customerName || '',
        customer_email: paymentData?.customerEmail || '',
        customer_phone_number: paymentData?.customerPhone || '',
        customer_address: paymentData?.customerAddress || '',
        customer_city: paymentData?.customerCity || '',
        customer_country: paymentData?.customerCountry || 'CI',
        customer_state: paymentData?.customerState || '',
        customer_zip_code: paymentData?.customerZip || ''
      };

      const response = await fetch(CINETPAY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("CinetPay response:", data);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check payment status
    if (action === 'check') {
      const { transactionId } = requestData;

      console.log(`Checking payment status for transaction ${transactionId}`);

      const payload = {
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: transactionId
      };

      const response = await fetch(CINETPAY_CHECK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("CinetPay check response:", data);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Webhook handler
    if (action === 'webhook') {
      const webhookData = requestData.data;
      console.log("CinetPay webhook payload:", webhookData);

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

      // Import Supabase JS client
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.8');
      
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
      
      return new Response(JSON.stringify({ success: true, message: 'Webhook processed successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in cinetpay function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
