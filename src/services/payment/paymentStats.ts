
import { getPaymentsByLeaseId } from './paymentCore';
import { supabase } from '@/lib/supabase';

export const getLeasePaymentStats = async (leaseId: string) => {
  try {
    const { data: payments, error } = await getPaymentsByLeaseId(leaseId);
    
    if (error) return { stats: null, error };
    
    const stats = {
      totalPaid: 0,
      totalDue: 0,
      pendingPayments: 0,
      latePayments: 0,
      undefinedPayments: 0,
      balance: 0
    };
    
    if (payments) {
      payments.forEach(payment => {
        // Add to total due
        stats.totalDue += payment.amount;
        
        // Calculate based on status
        if (payment.status === 'paid') {
          stats.totalPaid += payment.amount;
        } else if (payment.status === 'pending') {
          stats.pendingPayments++;
        } else if (payment.status === 'late') {
          stats.latePayments++;
        } else if (payment.status === 'undefined') {
          stats.undefinedPayments++;
        }
      });
      
      // Calculate balance
      stats.balance = stats.totalDue - stats.totalPaid;
    }
    
    return { stats, error: null };
  } catch (error: any) {
    console.error('Error calculating lease payment stats:', error);
    return { stats: null, error: error.message || 'An unknown error occurred' };
  }
};

export const getPaymentTotalsByType = async (leaseId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('payment_type, amount, status')
      .eq('lease_id', leaseId);
      
    if (error) return { totals: null, error: error.message };
    
    const totals = {
      deposit: {
        total: 0,
        paid: 0,
        pending: 0
      },
      agency_fee: {
        total: 0,
        paid: 0,
        pending: 0
      },
      rent: {
        total: 0,
        paid: 0,
        pending: 0
      },
      other: {
        total: 0,
        paid: 0,
        pending: 0
      }
    };
    
    data.forEach(payment => {
      const type = payment.payment_type || 'other';
      const amount = payment.amount || 0;
      
      // Add to total for this payment type
      if (totals[type]) {
        totals[type].total += amount;
        
        // Add to paid or pending based on status
        if (payment.status === 'paid') {
          totals[type].paid += amount;
        } else if (payment.status === 'pending' || payment.status === 'undefined') {
          totals[type].pending += amount;
        }
      } else {
        totals.other.total += amount;
        if (payment.status === 'paid') {
          totals.other.paid += amount;
        } else if (payment.status === 'pending' || payment.status === 'undefined') {
          totals.other.pending += amount;
        }
      }
    });
    
    return { totals, error: null };
  } catch (error: any) {
    console.error('Error calculating payment totals by type:', error);
    return { totals: null, error: error.message };
  }
};
