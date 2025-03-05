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
    
    if (data.code === '00' && data.data.status === 'ACCEPTED') {
      const { data: paymentData, error: fetchError } = await supabase
        .from('payments')
        .select('id')
        .eq('transaction_id', params.transactionId)
        .single();
      
      if (!fetchError && paymentData) {
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
    const { data, error } = await supabase.functions.invoke('cinetpay', {
      body: {
        action: 'webhook',
        data: webhookData
      }
    });
    
    if (error) {
      console.error('Error processing CinetPay webhook:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error in processCinetPayWebhook:', error);
    return { success: false, error: error.message };
  }
};
