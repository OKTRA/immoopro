import { supabase } from "@/lib/supabase";
import { BulkUpdateParams } from "./types";
import { calculateAndRecordCommission } from "./paymentCore";

export const bulkUpdatePayments = async (
  paymentIds: string[],
  updateData: BulkUpdateParams,
) => {
  try {
    if (!paymentIds || paymentIds.length === 0) {
      return { error: "No payment IDs provided" };
    }

    // Convert camelCase to snake_case for database
    const dbUpdateData: any = {};

    if (updateData.status !== undefined)
      dbUpdateData.status = updateData.status;
    if (updateData.notes !== undefined) dbUpdateData.notes = updateData.notes;

    // Add userId as processed_by if provided
    if (updateData.userId) dbUpdateData.processed_by = updateData.userId;

    const { data, error } = await supabase
      .from("payments")
      .update(dbUpdateData)
      .in("id", paymentIds)
      .select();

    if (error) {
      console.error("Error in bulk update payments:", error);
      return { error: "Failed to update payments" };
    }

    return {
      message: `Successfully updated ${data.length} payments`,
      updatedCount: data.length,
      payments: data,
    };
  } catch (error: any) {
    console.error("Error in bulkUpdatePayments:", error);
    return { error: error.message || "Failed to update payments in bulk" };
  }
};

export const bulkDeletePayments = async (paymentIds: string[]) => {
  try {
    if (!paymentIds || paymentIds.length === 0) {
      return { error: "No payment IDs provided" };
    }

    const { error } = await supabase
      .from("payments")
      .delete()
      .in("id", paymentIds);

    if (error) {
      console.error("Error in bulk delete payments:", error);
      return { error: "Failed to delete payments" };
    }

    return {
      message: `Successfully deleted ${paymentIds.length} payments`,
      deletedCount: paymentIds.length,
    };
  } catch (error: any) {
    console.error("Error in bulkDeletePayments:", error);
    return { error: error.message || "Failed to delete payments in bulk" };
  }
};

export const updateBulkPayments = async ({
  paymentIds,
  status,
  notes,
  userId,
}: BulkUpdateParams): Promise<{ success: boolean; error: string | null }> => {
  try {
    if (!paymentIds.length) {
      return { success: false, error: "Aucun paiement sélectionné" };
    }

    // Get previous status and type of each payment before updating
    const { data: previousPaymentsData, error: previousDataError } =
      await supabase
        .from("payments")
        .select("id, status, payment_type, amount, lease_id")
        .in("id", paymentIds);

    if (previousDataError)
      return { success: false, error: previousDataError.message };

    // Create a map of payment ID to previous data
    const previousPaymentsMap = previousPaymentsData.reduce(
      (acc, curr) => {
        acc[curr.id] = {
          status: curr.status,
          paymentType: curr.payment_type,
          amount: curr.amount,
          leaseId: curr.lease_id,
        };
        return acc;
      },
      {} as Record<
        string,
        { status: string; paymentType: string; amount: number; leaseId: string }
      >,
    );

    // Start a Supabase transaction by creating a bulk update record first
    const { data: bulkUpdateData, error: bulkUpdateError } = await supabase
      .from("payment_bulk_updates")
      .insert({
        user_id: userId,
        payments_count: paymentIds.length,
        status,
        notes,
      })
      .select()
      .single();

    if (bulkUpdateError)
      return { success: false, error: bulkUpdateError.message };

    // Update all payments
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status,
        notes: notes ? notes : undefined,
        processed_by: userId ? userId : undefined,
        payment_date:
          status === "paid"
            ? new Date().toISOString().split("T")[0]
            : undefined,
      })
      .in("id", paymentIds);

    if (updateError) return { success: false, error: updateError.message };

    // Create bulk update items for tracking
    const bulkUpdateItems = paymentIds.map((paymentId) => ({
      bulk_update_id: bulkUpdateData.id,
      payment_id: paymentId,
      previous_status: previousPaymentsMap[paymentId]?.status || null,
      new_status: status,
    }));

    const { error: itemsError } = await supabase
      .from("payment_bulk_update_items")
      .insert(bulkUpdateItems);

    if (itemsError) {
      console.error("Error creating bulk update items:", itemsError);
      // We don't return an error here as the payments were already updated
    }

    // If status changed to paid, calculate commissions for rent payments only
    // IMPORTANT: This only affects the payments being updated and does not modify
    // any historical payment data. Changes to commission rates will only affect
    // future payments.
    if (status === "paid") {
      for (const paymentId of paymentIds) {
        const prevData = previousPaymentsMap[paymentId];

        // Only calculate commission if previous status wasn't paid and it's a rent payment
        // Explicitly exclude agency_fee and deposit payment types
        if (
          prevData &&
          prevData.status !== "paid" &&
          prevData.paymentType === "rent" // Only apply commission to rent payments
        ) {
          try {
            await calculateAndRecordCommission(
              paymentId,
              prevData.leaseId,
              prevData.amount,
              prevData.paymentType,
            );
          } catch (commissionError) {
            console.error(
              `Error calculating commission for payment ${paymentId}:`,
              commissionError,
            );
            // Continue with other payments
          }
        }
      }
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error in bulk update:", error);
    return {
      success: false,
      error:
        error.message ||
        "Une erreur est survenue lors de la mise à jour en masse",
    };
  }
};
