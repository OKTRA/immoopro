
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { generateUniqueId } from '@/lib/utils';

interface CinetPayInitPaymentParams {
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  paymentData?: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    customerCity?: string;
    customerCountry?: string;
    customerState?: string;
    customerZip?: string;
  };
  currency?: string;
  leaseId?: string;
  paymentId?: string;
}

interface CinetPayCheckStatusParams {
  transactionId: string;
}

export const initCinetPayPayment = async (params: CinetPayInitPaymentParams) => {
  try {
    const transactionId = generateUniqueId();
    
    // Store initial payment record in database if leaseId is provided
    if (params.leaseId) {
      const { error } = await supabase
        .from('payments')
        .insert({
          lease_id: params.leaseId,
          amount: params.amount,
          payment_method: 'cinetpay',
          status: 'pending',
          payment_type: 'rent',
          is_auto_generated: false,
          notes: `CinetPay payment: ${params.description}`,
          transaction_id: transactionId,
          payment_provider_id: null,
          payment_provider_status: 'PENDING',
          payment_provider_data: { 
            init_time: new Date().toISOString() 
          }
        });
      
      if (error) {
        console.error('Error creating payment record:', error);
        toast.error('Impossible de créer l\'enregistrement de paiement');
        return { data: null, error: error.message };
      }
    }
    
    // Call CinetPay init endpoint using Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('cinetpay', {
      body: {
        action: 'init',
        amount: params.amount,
        currency: params.currency || 'XOF',
        description: params.description,
        transactionId,
        returnUrl: params.returnUrl,
        cancelUrl: params.cancelUrl,
        paymentData: params.paymentData
      }
    });
    
    if (error) {
      console.error('Error initializing CinetPay payment:', error);
      toast.error('Impossible d\'initialiser le paiement CinetPay');
      return { data: null, error: error.message };
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Error in initCinetPayPayment:', error);
    return { data: null, error: error.message };
  }
};

export const checkCinetPayPaymentStatus = async (params: CinetPayCheckStatusParams) => {
  try {
    const { data, error } = await supabase.functions.invoke('cinetpay', {
      body: {
        action: 'check',
        transactionId: params.transactionId
      }
    });
    
    if (error) {
      console.error('Error checking CinetPay payment status:', error);
      return { data: null, error: error.message };
    }
    
    // Update payment record in database if payment was successful
    if (data.code === '00' && data.data.status === 'ACCEPTED') {
      // Find payment by transaction_id
      const { data: paymentData, error: fetchError } = await supabase
        .from('payments')
        .select('id')
        .eq('transaction_id', params.transactionId)
        .single();
      
      if (!fetchError && paymentData) {
        // Update payment status
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'paid',
            payment_date: new Date().toISOString().split('T')[0],
            payment_provider_status: data.data.status,
            payment_provider_id: data.data.payment_token,
            payment_provider_data: data.data
          })
          .eq('id', paymentData.id);
        
        if (updateError) {
          console.error('Error updating payment record:', updateError);
        }
      }
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Error in checkCinetPayPaymentStatus:', error);
    return { data: null, error: error.message };
  }
};

export const processCinetPayWebhook = async (webhookData: any) => {
  try {
    // Implement webhook processing logic here
    console.log('Processing CinetPay webhook:', webhookData);
    
    // Extract transaction details
    const { cpm_trans_id, cpm_site_id, cpm_amount, cpm_currency, cpm_payment_date, cpm_payment_time, cpm_error_message, cpm_payment_method, cpm_phone_prefixe, cpm_phone_num, cpm_result, cpm_trans_status } = webhookData;
    
    if (cpm_result !== '00' || cpm_trans_status !== 'ACCEPTED') {
      console.log(`Payment not successful: ${cpm_error_message}`);
      return { success: false, error: cpm_error_message };
    }
    
    // Find the payment by transaction ID
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', cpm_trans_id)
      .single();
    
    if (fetchError || !payment) {
      console.error('Payment record not found:', fetchError);
      return { success: false, error: 'Payment record not found' };
    }
    
    // Update the payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        payment_date: new Date().toISOString().split('T')[0],
        payment_provider_status: cpm_trans_status,
        payment_provider_id: webhookData.payment_token || null,
        payment_method: cpm_payment_method || 'cinetpay',
        payment_provider_data: webhookData
      })
      .eq('id', payment.id);
    
    if (updateError) {
      console.error('Error updating payment record:', updateError);
      return { success: false, error: updateError.message };
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error processing CinetPay webhook:', error);
    return { success: false, error: error.message };
  }
};
