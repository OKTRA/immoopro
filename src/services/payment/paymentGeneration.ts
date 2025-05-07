import { supabase } from "@/lib/supabase";
import { PaymentData, getPaymentFrequency } from "./types";

/**
 * Generate recurring payments for a lease based on frequency
 * @param leaseId The ID of the lease
 * @param startDate Start date for payments
 * @param endDate End date for payments
 * @param amount Payment amount
 * @param frequency Payment frequency (monthly, weekly, etc)
 * @param paymentType Type of payment (rent, etc)
 * @returns Object with generated payments or error
 */
export const generateRecurringPayments = async (
  leaseId: string,
  startDate: string,
  endDate: string,
  amount: number,
  frequency: string = "monthly",
  paymentType: string = "rent",
) => {
  try {
    // Validate inputs
    if (!leaseId || !startDate || !endDate || amount <= 0) {
      return { error: "Invalid input parameters for payment generation" };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return { error: "Start date must be before end date" };
    }

    // Get frequency settings based on the frequency string
    const freqSettings = getPaymentFrequency(frequency);
    const { periodUnit, periodAmount } = freqSettings;

    // Generate payment dates based on frequency
    const paymentDates = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      paymentDates.push(new Date(currentDate));

      // Advance to next period based on frequency
      if (periodUnit === "days") {
        currentDate.setDate(currentDate.getDate() + periodAmount);
      } else if (periodUnit === "weeks") {
        currentDate.setDate(currentDate.getDate() + periodAmount * 7);
      } else if (periodUnit === "months") {
        currentDate.setMonth(currentDate.getMonth() + periodAmount);
      } else if (periodUnit === "years") {
        currentDate.setFullYear(currentDate.getFullYear() + periodAmount);
      }
    }

    // Check if payments already exist for these dates
    const { data: existingPayments, error: fetchError } = await supabase
      .from("payments")
      .select("due_date")
      .eq("lease_id", leaseId)
      .eq("payment_type", paymentType);

    if (fetchError) {
      console.error("Error checking existing payments:", fetchError);
      return { error: "Failed to check existing payments" };
    }

    // Filter out dates that already have payments
    const existingDates =
      existingPayments?.map(
        (p) => new Date(p.due_date).toISOString().split("T")[0],
      ) || [];
    const newPaymentDates = paymentDates.filter(
      (date) => !existingDates.includes(date.toISOString().split("T")[0]),
    );

    if (newPaymentDates.length === 0) {
      return { message: "No new payments to generate", paymentsGenerated: 0 };
    }

    // Create payment records
    const paymentsToInsert = newPaymentDates.map((date) => ({
      lease_id: leaseId,
      amount: amount,
      due_date: date.toISOString().split("T")[0],
      status: "pending",
      payment_type: paymentType,
      payment_method: "bank_transfer", // Default payment method
      is_auto_generated: true,
    }));

    const { data, error } = await supabase
      .from("payments")
      .insert(paymentsToInsert)
      .select();

    if (error) {
      console.error("Error generating payments:", error);
      return { error: "Failed to generate payments" };
    }

    return {
      message: `Successfully generated ${data.length} payments`,
      paymentsGenerated: data.length,
      payments: data,
    };
  } catch (error: any) {
    console.error("Error in generateRecurringPayments:", error);
    return { error: error.message || "Failed to generate recurring payments" };
  }
};

/**
 * Generate initial payments for a lease (deposit, agency fee)
 * @param leaseId The ID of the lease
 * @param leaseData The lease data object
 * @returns Object with generated payments or error
 */
export const generateInitialPayments = async (
  leaseId: string,
  leaseData: any,
) => {
  try {
    if (!leaseId || !leaseData) {
      return { error: "Invalid lease data for initial payment generation" };
    }

    const initialPayments = [];
    const leaseCreationDate =
      leaseData.created_at || new Date().toISOString().split("T")[0];

    // Check if deposit payment already exists
    const { data: existingDeposit, error: depositError } = await supabase
      .from("payments")
      .select("id")
      .eq("lease_id", leaseId)
      .eq("payment_type", "deposit")
      .maybeSingle();

    if (depositError) {
      console.error("Error checking existing deposit payment:", depositError);
    } else if (!existingDeposit && leaseData.security_deposit > 0) {
      // Add deposit payment if it doesn't exist
      initialPayments.push({
        lease_id: leaseId,
        amount: leaseData.security_deposit || 0,
        payment_date: leaseCreationDate,
        status: "pending",
        payment_type: "deposit",
        payment_method: "bank_transfer",
        is_auto_generated: true,
      });
    }

    // Check if agency fee payment already exists
    const { data: existingAgencyFee, error: agencyFeeError } = await supabase
      .from("payments")
      .select("id")
      .eq("lease_id", leaseId)
      .eq("payment_type", "agency_fee")
      .maybeSingle();

    if (agencyFeeError) {
      console.error(
        "Error checking existing agency fee payment:",
        agencyFeeError,
      );
    } else if (!existingAgencyFee && leaseData.agency_fee > 0) {
      // Add agency fee payment if it doesn't exist
      initialPayments.push({
        lease_id: leaseId,
        amount: leaseData.agency_fee || 0,
        payment_date: leaseCreationDate,
        status: "pending",
        payment_type: "agency_fee",
        payment_method: "bank_transfer",
        is_auto_generated: true,
      });
    }

    if (initialPayments.length === 0) {
      return {
        message: "No initial payments to generate",
        paymentsGenerated: 0,
      };
    }

    // Insert the initial payments
    const { data, error } = await supabase
      .from("payments")
      .insert(initialPayments)
      .select();

    if (error) {
      console.error("Error generating initial payments:", error);
      return { error: "Failed to generate initial payments" };
    }

    return {
      message: `Successfully generated ${data.length} initial payments`,
      paymentsGenerated: data.length,
      payments: data,
    };
  } catch (error: any) {
    console.error("Error in generateInitialPayments:", error);
    return { error: error.message || "Failed to generate initial payments" };
  }
};

/**
 * Generate historical payments for a lease from a start date until today
 * @param leaseId The ID of the lease
 * @param amount Payment amount
 * @param startDate Start date for payments
 * @param frequency Payment frequency (monthly, weekly, etc)
 * @returns Object with generated payments or error
 */
export const generateHistoricalPayments = async (
  leaseId: string,
  amount: number,
  startDate: string,
  frequency: string = "monthly",
) => {
  try {
    // Validate inputs
    if (!leaseId || !startDate || amount <= 0) {
      return {
        error: "Invalid input parameters for historical payment generation",
      };
    }

    // Use today as the end date for historical payments
    const today = new Date();
    const endDate = today.toISOString().split("T")[0];

    // Use the recurring payments function to generate historical payments
    const result = await generateRecurringPayments(
      leaseId,
      startDate,
      endDate,
      amount,
      frequency,
      "rent", // Default to rent type for historical payments
    );

    return {
      ...result,
      message: result.message ? `Historical: ${result.message}` : undefined,
      data: result.payments,
    };
  } catch (error: any) {
    console.error("Error in generateHistoricalPayments:", error);
    return { error: error.message || "Failed to generate historical payments" };
  }
};
