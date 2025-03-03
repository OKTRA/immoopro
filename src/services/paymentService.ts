import { supabase, handleSupabaseError } from '@/lib/supabase';
import { toast } from 'sonner';

export interface PaymentData {
  id?: string;
  lease_id: string;
  amount: number;
  payment_date: string;
  status: 'pending' | 'completed' | 'failed' | 'late' | 'undefined';
  payment_method: string;
  transaction_id?: string;
  notes?: string;
  payment_type?: 'initial' | 'rent';
  is_auto_generated?: boolean;
  due_date?: string;
  processed_by?: string;
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
    const undefinedPayments = payments.filter(p => p.status === 'undefined').length;
    
    return { 
      stats: {
        totalPaid,
        totalDue,
        pendingPayments,
        latePayments,
        undefinedPayments,
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
        undefinedPayments: 0,
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

/**
 * Generate all expected payments for a lease from payment start date to current date
 */
export const generateHistoricalPayments = async (
  leaseId: string, 
  paymentStartDate: string, 
  paymentFrequency: string, 
  monthlyRent: number
) => {
  try {
    console.log(`Generating historical payments for lease ${leaseId}`);
    console.log(`Start date: ${paymentStartDate}, Frequency: ${paymentFrequency}, Rent: ${monthlyRent}`);
    
    // Convert payment frequency to milliseconds
    const frequencyInDays = getFrequencyInDays(paymentFrequency);
    if (!frequencyInDays) {
      throw new Error("Invalid payment frequency");
    }

    // Calculate all payment dates from start to now
    const startDate = new Date(paymentStartDate);
    const today = new Date();
    const paymentDates = [];
    let currentDate = new Date(startDate);

    // Add the start date as the first payment date
    paymentDates.push(new Date(startDate));

    // Generate subsequent payment dates
    while (true) {
      let nextDate;
      
      if (paymentFrequency === 'monthly') {
        // For monthly, increment by 1 month but keep the same day
        nextDate = new Date(currentDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (paymentFrequency === 'quarterly') {
        // For quarterly, increment by 3 months
        nextDate = new Date(currentDate);
        nextDate.setMonth(nextDate.getMonth() + 3);
      } else if (paymentFrequency === 'biannual') {
        // For biannual (semi-annual), increment by 6 months
        nextDate = new Date(currentDate);
        nextDate.setMonth(nextDate.getMonth() + 6);
      } else if (paymentFrequency === 'annual') {
        // For annual, increment by 1 year
        nextDate = new Date(currentDate);
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      } else {
        // For daily/weekly, add the number of days
        nextDate = new Date(currentDate.getTime() + (frequencyInDays * 24 * 60 * 60 * 1000));
      }
      
      // If next date is beyond today, stop
      if (nextDate > today) {
        break;
      }
      
      paymentDates.push(nextDate);
      currentDate = nextDate;
    }

    console.log(`Generated ${paymentDates.length} payment dates`);

    // Check if payments already exist for these dates
    const { data: existingPayments, error: fetchError } = await supabase
      .from('payments')
      .select('payment_date')
      .eq('lease_id', leaseId);

    if (fetchError) throw fetchError;

    // Format the dates of existing payments for comparison
    const existingPaymentDates = (existingPayments || []).map(p => 
      new Date(p.payment_date).toISOString().split('T')[0]
    );

    // Filter out dates that already have payments
    const newPaymentDates = paymentDates.filter(date => 
      !existingPaymentDates.includes(date.toISOString().split('T')[0])
    );

    console.log(`After filtering, ${newPaymentDates.length} new payments to create`);

    // If no new payments needed, return
    if (newPaymentDates.length === 0) {
      return { 
        success: true, 
        message: "No new payments needed", 
        paymentsCreated: 0,
        error: null 
      };
    }

    // Create payment objects for all new dates
    const paymentsToCreate = newPaymentDates.map(date => ({
      lease_id: leaseId,
      amount: monthlyRent,
      payment_date: date.toISOString().split('T')[0],
      due_date: date.toISOString().split('T')[0],
      status: 'undefined',
      payment_method: '',
      payment_type: 'rent',
      is_auto_generated: true,
      notes: `Paiement généré automatiquement le ${new Date().toLocaleDateString()}`
    }));

    // Insert all payments in a batch
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentsToCreate)
      .select();

    if (error) throw error;

    return { 
      success: true, 
      message: `Created ${paymentsToCreate.length} payments successfully`, 
      paymentsCreated: paymentsToCreate.length,
      payments: data,
      error: null 
    };
  } catch (error: any) {
    console.error('Error generating historical payments:', error);
    return { 
      success: false, 
      message: `Error generating payments: ${error.message}`,
      paymentsCreated: 0,
      error: error.message 
    };
  }
};

/**
 * Update multiple payments at once
 */
export const updateBulkPayments = async (
  paymentIds: string[], 
  newStatus: 'completed' | 'pending' | 'late' | 'failed' | 'undefined',
  notes?: string,
  processedBy?: string
) => {
  try {
    // Create a bulk update record
    const { data: bulkUpdate, error: bulkError } = await supabase
      .from('payment_bulk_updates')
      .insert([{
        payments_count: paymentIds.length,
        status: newStatus,
        notes: notes || `Bulk update to ${newStatus}`,
        user_id: processedBy
      }])
      .select()
      .single();

    if (bulkError) throw bulkError;

    // Get current status of all payments
    const { data: currentPayments, error: fetchError } = await supabase
      .from('payments')
      .select('id, status')
      .in('id', paymentIds);

    if (fetchError) throw fetchError;

    // Update all payments
    const { data, error } = await supabase
      .from('payments')
      .update({ 
        status: newStatus,
        notes: notes || `Mis à jour en masse le ${new Date().toLocaleDateString()}`,
        processed_by: processedBy
      })
      .in('id', paymentIds)
      .select();

    if (error) throw error;

    // Record each update in the history table
    const bulkUpdateItems = paymentIds.map(paymentId => {
      const currentPayment = currentPayments?.find(p => p.id === paymentId);
      return {
        bulk_update_id: bulkUpdate.id,
        payment_id: paymentId,
        previous_status: currentPayment?.status || 'unknown',
        new_status: newStatus
      };
    });

    const { error: historyError } = await supabase
      .from('payment_bulk_update_items')
      .insert(bulkUpdateItems);

    if (historyError) {
      console.error('Error recording bulk update history:', historyError);
      // Continue despite history error
    }

    return { 
      success: true, 
      updatedCount: paymentIds.length,
      bulkUpdateId: bulkUpdate.id,
      error: null 
    };
  } catch (error: any) {
    console.error('Error in bulk update payments:', error);
    return { 
      success: false, 
      updatedCount: 0,
      error: error.message 
    };
  }
};

// Helper function to convert payment frequency to days
export const getFrequencyInDays = (frequency: string): number | null => {
  switch (frequency) {
    case 'daily':
      return 1;
    case 'weekly':
      return 7;
    case 'monthly':
      return 30; // Approximation for calculation purposes
    case 'quarterly':
      return 90; // Approximation
    case 'biannual':
      return 180; // Approximation
    case 'annual':
      return 365; // Approximation
    default:
      return null;
  }
};
