import { supabase } from "@/lib/supabase";
import { calculateNextDueDate, getPaymentFrequency } from "@/lib/utils";

/**
 * Create initial payments for a new lease (security deposit and agency fees)
 */
export const createInitialPayments = async (
  leaseId: string,
  securityDeposit: number,
  agencyFees: number,
  asPaid = false,
  paymentDate?: string, // Payment date parameter
) => {
  try {
    // Get lease details to ensure proper due date calculation
    const { data: leaseData, error: leaseError } = await supabase
      .from("leases")
      .select("start_date, payment_start_date, payment_frequency, payment_day")
      .eq("id", leaseId)
      .single();

    if (leaseError) {
      console.error("Error fetching lease details for payments:", leaseError);
      throw leaseError;
    }

    // Use the lease start date or payment start date for initial payments
    const effectiveStartDate =
      leaseData.payment_start_date || leaseData.start_date;

    // Use provided payment date or default to effective start date
    const effectivePaymentDate = paymentDate || effectiveStartDate;

    const payments = [];

    // Add security deposit payment (due on lease start date as a one-time payment)
    if (securityDeposit > 0) {
      payments.push({
        lease_id: leaseId,
        amount: securityDeposit,
        payment_date: asPaid ? effectivePaymentDate : null, // Set payment_date based on asPaid flag
        due_date: effectiveStartDate, // Set due_date to lease start date for deposit
        payment_method: "bank_transfer",
        status: asPaid ? "paid" : "undefined", // Use undefined instead of pending
        payment_type: "deposit",
        is_auto_generated: true,
        notes: "Caution initiale",
      });
    }

    // Add agency fees payment if applicable (due on lease start date as a one-time payment)
    if (agencyFees > 0) {
      payments.push({
        lease_id: leaseId,
        amount: agencyFees,
        payment_date: asPaid ? effectivePaymentDate : null, // Set payment_date based on asPaid flag
        due_date: effectiveStartDate, // Set due_date to lease start date for agency fees
        payment_method: "bank_transfer",
        status: asPaid ? "paid" : "undefined", // Use undefined instead of pending
        payment_type: "agency_fee",
        is_auto_generated: true,
        notes: "Frais d'agence",
      });
    }

    if (payments.length > 0) {
      const { error } = await supabase.from("payments").insert(payments);

      if (error) {
        console.error("Error creating initial payments:", error);
        throw error;
      }
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error creating initial payments:", error);
    return { success: false, error: error.message };
  }
};
