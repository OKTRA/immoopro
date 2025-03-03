
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { toast } from 'sonner';

export interface PaymentData {
  id?: string;
  lease_id: string;
  amount: number;
  payment_date: string;
  status: 'pending' | 'completed' | 'failed' | 'late';
  payment_method: string;
  transaction_id?: string;
  notes?: string;
}

/**
 * Get all payments for a specific lease
 */
export const getPaymentsByLeaseId = async (leaseId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('lease_id', leaseId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return { payments: data, error: null };
  } catch (error: any) {
    console.error(`Error getting payments for lease ${leaseId}:`, error);
    return { payments: [], error: error.message };
  }
};

/**
 * Create a new payment
 */
export const createPayment = async (paymentData: PaymentData) => {
  try {
    console.log('Creating payment with data:', paymentData);
    
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating payment:', error);
      throw error;
    }
    
    return { payment: data, error: null };
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return { payment: null, error: error.message };
  }
};

/**
 * Update a payment
 */
export const updatePayment = async (id: string, paymentData: Partial<PaymentData>) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update(paymentData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { payment: data, error: null };
  } catch (error: any) {
    console.error(`Error updating payment with ID ${id}:`, error);
    return { payment: null, error: error.message };
  }
};

/**
 * Delete a payment
 */
export const deletePayment = async (id: string) => {
  try {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Error deleting payment with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get payment stats for a lease
 */
export const getLeasePaymentStats = async (leaseId: string) => {
  try {
    // Get all payments for this lease
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('lease_id', leaseId);

    if (error) throw error;
    
    // Get lease details to know total expected payments
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select('*')
      .eq('id', leaseId)
      .single();

    if (leaseError) throw leaseError;
    
    // Calculate stats
    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    const totalDue = lease.monthly_rent || 0;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const latePayments = payments.filter(p => p.status === 'late').length;
    
    return { 
      stats: {
        totalPaid,
        totalDue,
        pendingPayments,
        latePayments,
        balance: totalDue - totalPaid
      }, 
      error: null 
    };
  } catch (error: any) {
    console.error(`Error getting payment stats for lease ${leaseId}:`, error);
    return { 
      stats: {
        totalPaid: 0,
        totalDue: 0,
        pendingPayments: 0,
        latePayments: 0,
        balance: 0
      }, 
      error: error.message 
    };
  }
};

/**
 * Get lease details including payment information
 */
export const getLeaseWithPayments = async (leaseId: string) => {
  try {
    // Get lease details
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        tenants:tenant_id (
          id, 
          first_name, 
          last_name, 
          email, 
          phone
        ),
        properties:property_id (
          id, 
          title, 
          location, 
          price
        )
      `)
      .eq('id', leaseId)
      .single();

    if (leaseError) throw leaseError;
    
    // Get payments for this lease
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('lease_id', leaseId)
      .order('payment_date', { ascending: false });

    if (paymentsError) throw paymentsError;
    
    return { 
      lease, 
      payments,
      error: null 
    };
  } catch (error: any) {
    console.error(`Error getting lease with payments ${leaseId}:`, error);
    return { 
      lease: null, 
      payments: [],
      error: error.message 
    };
  }
};
