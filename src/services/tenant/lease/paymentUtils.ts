
import { supabase } from '@/lib/supabase';

/**
 * Create initial payments for a new lease (security deposit and agency fees)
 */
export const createInitialPayments = async (
  leaseId: string, 
  securityDeposit: number, 
  agencyFees: number, 
  asPaid = false,
  paymentDate?: string // Add parameter for payment date
) => {
  try {
    // Use provided payment date or default to today
    const effectiveDate = paymentDate || new Date().toISOString().split('T')[0];
    const payments = [];
    
    // Add security deposit payment
    if (securityDeposit > 0) {
      payments.push({
        lease_id: leaseId,
        amount: securityDeposit,
        payment_date: effectiveDate,
        due_date: effectiveDate,
        payment_method: 'bank_transfer',
        status: asPaid ? 'paid' : 'pending',
        payment_type: 'deposit',
        is_auto_generated: true,
        notes: 'Caution initiale'
      });
    }
    
    // Add agency fees payment if applicable
    if (agencyFees > 0) {
      payments.push({
        lease_id: leaseId,
        amount: agencyFees,
        payment_date: effectiveDate,
        due_date: effectiveDate,
        payment_method: 'bank_transfer',
        status: asPaid ? 'paid' : 'pending',
        payment_type: 'agency_fee',
        is_auto_generated: true,
        notes: "Frais d'agence"
      });
    }
    
    if (payments.length > 0) {
      const { error } = await supabase
        .from('payments')
        .insert(payments);
        
      if (error) {
        console.error('Error creating initial payments:', error);
        throw error;
      }
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error creating initial payments:', error);
    return { success: false, error: error.message };
  }
};
