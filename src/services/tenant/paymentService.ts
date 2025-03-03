
import { supabase } from '@/lib/supabase';
import { ApartmentLeasePayment } from '@/assets/types';

/**
 * Get payments by tenant ID
 */
export const getPaymentsByTenantId = async (
  tenantId: string,
  limit = 10,
  offset = 0
) => {
  try {
    const { data, error, count } = await supabase
      .from('apartment_lease_payments')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('payment_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { payments: data, count, error: null };
  } catch (error: any) {
    console.error(`Error getting payments for tenant ${tenantId}:`, error);
    return { payments: [], count: 0, error: error.message };
  }
};

/**
 * Create a payment
 */
export const createPayment = async (paymentData: Omit<ApartmentLeasePayment, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('apartment_lease_payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) throw error;
    return { payment: data, error: null };
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return { payment: null, error: error.message };
  }
};
