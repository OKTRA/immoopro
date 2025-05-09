import { supabase } from "@/lib/supabase";

interface TerminateLeaseParams {
  leaseId: string;
  propertyId: string;
  conditionReportData?: {
    damagesAmount: number;
    notes: string;
  };
}

/**
 * Terminates a lease, updates property status to available, and handles security deposit
 */
export const terminateLease = async ({
  leaseId,
  propertyId,
  conditionReportData,
}: TerminateLeaseParams) => {
  try {
    // Start a transaction by getting the lease data first
    const { data: leaseData, error: leaseError } = await supabase
      .from("leases")
      .select("security_deposit, tenant_id")
      .eq("id", leaseId)
      .single();

    if (leaseError) {
      console.error("Error fetching lease data:", leaseError);
      return { success: false, error: leaseError.message };
    }

    // Calculate deposit amount to return based on condition report
    const securityDeposit = leaseData.security_deposit || 0;
    const damagesAmount = conditionReportData?.damagesAmount || 0;
    const depositToReturn = Math.max(0, securityDeposit - damagesAmount);

    // 1. Update lease status to closed
    const { error: updateLeaseError } = await supabase
      .from("leases")
      .update({
        status: "closed",
        end_date: new Date().toISOString().split("T")[0], // Set end date to today
        termination_notes: conditionReportData?.notes || "Bail clôturé",
        termination_date: new Date().toISOString(),
      })
      .eq("id", leaseId);

    if (updateLeaseError) {
      console.error("Error updating lease status:", updateLeaseError);
      return { success: false, error: updateLeaseError.message };
    }

    // 2. Update property status to available
    const { error: updatePropertyError } = await supabase
      .from("properties")
      .update({ status: "available" })
      .eq("id", propertyId);

    if (updatePropertyError) {
      console.error("Error updating property status:", updatePropertyError);
      return { success: false, error: updatePropertyError.message };
    }

    // 3. Cancel all future payments
    const today = new Date().toISOString().split("T")[0];
    const { error: updatePaymentsError } = await supabase
      .from("payments")
      .update({ status: "cancelled" })
      .eq("lease_id", leaseId)
      .gt("due_date", today)
      .is("payment_date", null); // Only update payments that haven't been paid yet

    if (updatePaymentsError) {
      console.error("Error cancelling future payments:", updatePaymentsError);
      // Continue anyway, this is not critical
    }

    // 4. Create a deposit return payment record if there's a deposit to return
    if (depositToReturn > 0) {
      const { error: createPaymentError } = await supabase
        .from("payments")
        .insert({
          lease_id: leaseId,
          amount: depositToReturn * -1, // Negative amount because it's money going out
          payment_date: new Date().toISOString().split("T")[0],
          status: "paid",
          payment_type: "deposit_return",
          payment_method: "bank_transfer",
          notes: `Remboursement de caution suite à l'état des lieux. ${conditionReportData?.notes || ""}`,
          is_auto_generated: true,
        });

      if (createPaymentError) {
        console.error(
          "Error creating deposit return payment:",
          createPaymentError,
        );
        // Continue anyway, this is not critical
      }
    }

    // 5. Create a damages payment record if there are damages
    if (damagesAmount > 0) {
      const { error: createDamagesError } = await supabase
        .from("payments")
        .insert({
          lease_id: leaseId,
          amount: damagesAmount,
          payment_date: new Date().toISOString().split("T")[0],
          status: "paid",
          payment_type: "damages",
          payment_method: "deduction",
          notes: `Déduction pour dommages suite à l'état des lieux. ${conditionReportData?.notes || ""}`,
          is_auto_generated: true,
        });

      if (createDamagesError) {
        console.error("Error creating damages payment:", createDamagesError);
        // Continue anyway, this is not critical
      }
    }

    return {
      success: true,
      depositReturned: depositToReturn,
      damagesAmount: damagesAmount,
      message: "Bail clôturé avec succès",
    };
  } catch (error: any) {
    console.error("Error terminating lease:", error);
    return { success: false, error: error.message };
  }
};
