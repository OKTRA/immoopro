
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
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Initialize payment
    if (path === 'init') {
      const { 
        amount, 
        currency = "XOF", 
        description, 
        transactionId, 
        returnUrl, 
        cancelUrl, 
        paymentData 
      } = await req.json();

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
        notify_url: `${url.origin}/api/cinetpay-webhook`,
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
    if (path === 'check') {
      const { transactionId } = await req.json();

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
    if (path === 'webhook') {
      const payload = await req.json();
      console.log("CinetPay webhook payload:", payload);

      // Process the webhook data
      // Update payment status in database
      // This will be implemented in a separate step

      return new Response(JSON.stringify({ message: 'Webhook received' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 404,
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
