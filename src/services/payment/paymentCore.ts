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
    // Convert from camelCase to snake_case for database
    const dbPayment = {
      lease_id: paymentData.leaseId,
      amount: paymentData.amount,
      due_date: paymentData.dueDate,
      payment_date: paymentData.paymentDate,
      status: paymentData.status,
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
    // Convert from camelCase to snake_case for database
    const dbPayment = {
      amount: paymentData.amount,
      due_date: paymentData.dueDate,
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
