import { PaymentData } from "./types";
import { supabase } from "@/lib/supabase";

export const getLeaseWithPayments = async (leaseId: string) => {
  try {
    // Fetch lease data
    const { data: leaseData, error: leaseError } = await supabase
      .from("leases")
      .select("*, properties(*), tenants(*)")
      .eq("id", leaseId)
      .single();

    if (leaseError) {
      console.error("Error fetching lease:", leaseError);
      return { error: "Failed to fetch lease data" };
    }

    // Fetch payments for this lease
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .eq("lease_id", leaseId)
      .order("due_date", { ascending: true });

    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
      return { error: "Failed to fetch payment data" };
    }

    // Format payments to match the expected structure
    const formattedPayments =
      paymentsData?.map((payment) => ({
        id: payment.id,
        leaseId: payment.lease_id,
        amount: payment.amount,
        dueDate: payment.due_date,
        paymentDate: payment.payment_date,
        status: payment.status,
        paymentType: payment.payment_type || "rent",
        paymentMethod: payment.payment_method,
        notes: payment.notes,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
      })) || [];

    return {
      lease: leaseData,
      payments: formattedPayments,
      error: null,
    };
  } catch (error: any) {
    console.error("Error in getLeaseWithPayments:", error);
    return { error: error.message || "Failed to fetch lease payments" };
  }
};

export const getPaymentsByLeaseId = async (leaseId: string) => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("lease_id", leaseId)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching payments:", error);
      return { error: "Failed to fetch payments" };
    }

    // Format payments to match the expected structure
    const formattedPayments =
      data?.map((payment) => ({
        id: payment.id,
        leaseId: payment.lease_id,
        amount: payment.amount,
        dueDate: payment.due_date,
        paymentDate: payment.payment_date,
        status: payment.status,
        paymentType: payment.payment_type || "rent",
        paymentMethod: payment.payment_method,
        notes: payment.notes,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
      })) || [];

    return { payments: formattedPayments, error: null };
  } catch (error: any) {
    console.error("Error in getPaymentsByLeaseId:", error);
    return { error: error.message || "Failed to fetch payments" };
  }
};

export const createPayment = async (paymentData: PaymentData) => {
  try {
    // Special handling for deposit and agency_fee payment types
    const isInitialPayment = ["deposit", "agency_fee"].includes(
      paymentData.paymentType,
    );

    // Convert from camelCase to snake_case for database
    const dbPayment = {
      lease_id: paymentData.leaseId,
      amount: paymentData.amount,
      due_date: isInitialPayment ? null : paymentData.dueDate, // No due date for initial payments
      payment_date: isInitialPayment
        ? new Date().toISOString().split("T")[0]
        : paymentData.paymentDate, // Use today for initial payments
      status: paymentData.status || "undefined", // Default to undefined if not specified
      payment_type: paymentData.paymentType,
      payment_method: paymentData.paymentMethod,
      notes: paymentData.notes,
    };

    const { data, error } = await supabase
      .from("payments")
      .insert([dbPayment])
      .select()
      .single();

    if (error) {
      console.error("Error creating payment:", error);
      return { error: "Failed to create payment" };
    }

    // If payment is marked as paid and is a rent payment, calculate and record commission
    if (
      paymentData.status === "paid" &&
      data &&
      paymentData.paymentType === "rent"
    ) {
      await calculateAndRecordCommission(
        data.id,
        data.lease_id,
        paymentData.amount,
        paymentData.paymentType,
      );
    }

    // Format the returned payment to match the expected structure
    const formattedPayment = {
      id: data.id,
      leaseId: data.lease_id,
      amount: data.amount,
      dueDate: data.due_date,
      paymentDate: data.payment_date,
      status: data.status,
      paymentType: data.payment_type,
      paymentMethod: data.payment_method,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { payment: formattedPayment, error: null };
  } catch (error: any) {
    console.error("Error in createPayment:", error);
    return { error: error.message || "Failed to create payment" };
  }
};

export const updatePayment = async (
  paymentId: string,
  paymentData: PaymentData,
) => {
  try {
    // Get previous payment status and type before update
    const { data: prevPayment } = await supabase
      .from("payments")
      .select("status, payment_type")
      .eq("id", paymentId)
      .single();

    // Special handling for deposit and agency_fee payment types
    const isInitialPayment = ["deposit", "agency_fee"].includes(
      paymentData.paymentType,
    );

    // Convert from camelCase to snake_case for database
    const dbPayment = {
      amount: paymentData.amount,
      due_date: isInitialPayment ? null : paymentData.dueDate, // No due date for initial payments
      payment_date: paymentData.paymentDate,
      status: paymentData.status,
      payment_type: paymentData.paymentType,
      payment_method: paymentData.paymentMethod,
      notes: paymentData.notes,
    };

    const { data, error } = await supabase
      .from("payments")
      .update(dbPayment)
      .eq("id", paymentId)
      .select()
      .single();

    if (error) {
      console.error("Error updating payment:", error);
      return { error: "Failed to update payment" };
    }

    // If payment status changed to paid and it's a rent payment, calculate and record commission
    if (
      data &&
      prevPayment &&
      prevPayment.status !== "paid" &&
      paymentData.status === "paid" &&
      paymentData.paymentType === "rent"
    ) {
      await calculateAndRecordCommission(
        paymentId,
        data.lease_id,
        paymentData.amount,
        paymentData.paymentType,
      );
    }

    // Format the returned payment to match the expected structure
    const formattedPayment = {
      id: data.id,
      leaseId: data.lease_id,
      amount: data.amount,
      dueDate: data.due_date,
      paymentDate: data.payment_date,
      status: data.status,
      paymentType: data.payment_type,
      paymentMethod: data.payment_method,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { payment: formattedPayment, error: null };
  } catch (error: any) {
    console.error("Error in updatePayment:", error);
    return { error: error.message || "Failed to update payment" };
  }
};

export const deletePayment = async (paymentId: string) => {
  try {
    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (error) {
      console.error("Error deleting payment:", error);
      return { error: "Failed to delete payment" };
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error in deletePayment:", error);
    return { error: error.message || "Failed to delete payment" };
  }
};

// Calculate and record commission when a payment is marked as paid
// IMPORTANT: This function only calculates commissions for rent payments and
// does not modify any historical payment data. Changes to commission rates
// will only affect future payments.
export async function calculateAndRecordCommission(
  paymentId: string,
  leaseId: string,
  amount: number,
  paymentType: string = "rent",
) {
  try {
    // Only calculate commission for rent payments
    if (paymentType !== "rent") {
      console.log(
        `No commission calculated for payment ${paymentId} - not a rent payment (type: ${paymentType})`,
      );
      return;
    }

    // Get the lease to find the property
    const { data: lease } = await supabase
      .from("leases")
      .select("property_id")
      .eq("id", leaseId)
      .single();

    if (!lease) return;

    // Get the property to find the commission rate
    const { data: property } = await supabase
      .from("properties")
      .select("agency_commission_rate")
      .eq("id", lease.property_id)
      .single();

    if (!property) return;

    // Use the property's commission rate or default to 10%
    const commissionRate = property.agency_commission_rate || 10;
    const commissionAmount = (amount * commissionRate) / 100;

    // Record the commission in a commissions table if it exists
    try {
      await supabase.from("commissions").insert({
        payment_id: paymentId,
        lease_id: leaseId,
        property_id: lease.property_id,
        amount: commissionAmount,
        rate: commissionRate,
        status: "pending", // Default to pending until processed
        created_at: new Date().toISOString(),
      });
      console.log(
        `Commission of ${commissionAmount} recorded for payment ${paymentId}`,
      );
    } catch (commissionError) {
      // If the commissions table doesn't exist, log the error but don't fail the payment
      console.error(
        "Error recording commission (table may not exist):",
        commissionError,
      );
    }
  } catch (error) {
    console.error("Error calculating commission:", error);
  }
}
