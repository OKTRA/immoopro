import { supabase } from "@/lib/supabase";
import { PaymentData } from "./types";

export const getLeasePaymentStats = async (leaseId: string) => {
  try {
    // Fetch all payments for this lease
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("lease_id", leaseId);

    if (error) return { stats: null, error: error.message };

    const stats = {
      totalPaid: 0,
      totalDue: 0,
      pendingPayments: 0,
      latePayments: 0,
      advancedPayments: 0,
      undefinedPayments: 0,
      balance: 0,
    };

    if (payments) {
      payments.forEach((payment) => {
        // Add to total due
        stats.totalDue += payment.amount;

        // Determine effective status
        const effectiveStatus = determinePaymentStatus(
          payment.due_date,
          payment.payment_date,
          5, // 5-day grace period
        );

        // Calculate based on determined status
        if (effectiveStatus === "paid") {
          stats.totalPaid += payment.amount;
        } else if (effectiveStatus === "pending") {
          stats.pendingPayments++;
        } else if (effectiveStatus === "late") {
          stats.latePayments++;
        } else if (effectiveStatus === "advanced") {
          stats.advancedPayments++;
          stats.totalPaid += payment.amount; // It's still paid
        } else if (effectiveStatus === "undefined") {
          stats.undefinedPayments++;
        }
      });

      // Calculate balance
      stats.balance = stats.totalDue - stats.totalPaid;
    }

    return { stats, error: null };
  } catch (error: any) {
    console.error("Error calculating lease payment stats:", error);
    return { stats: null, error: error.message || "An unknown error occurred" };
  }
};

// Helper function to determine payment status based on dates
export const determinePaymentStatus = (
  dueDate: string | null,
  paymentDate: string | null,
  gracePeriodDays: number = 5,
): "paid" | "pending" | "late" | "undefined" | "advanced" => {
  if (!dueDate) return "undefined";

  const dueDateObj = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate grace period date
  const gracePeriodDate = new Date(dueDateObj);
  gracePeriodDate.setDate(gracePeriodDate.getDate() + gracePeriodDays);

  if (paymentDate) {
    const paymentDateObj = new Date(paymentDate);
    paymentDateObj.setHours(0, 0, 0, 0);

    // Payment made before due date
    if (paymentDateObj < dueDateObj) {
      return "advanced";
    }

    // Payment made on or after due date
    return "paid";
  } else {
    // No payment made yet
    if (today <= gracePeriodDate) {
      return "pending";
    } else {
      return "late";
    }
  }
};

export const getPaymentTotalsByType = async (leaseId: string) => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("payment_type, amount, status")
      .eq("lease_id", leaseId);

    if (error) return { totals: null, error: error.message };

    const totals = {
      deposit: {
        total: 0,
        paid: 0,
        pending: 0,
      },
      agency_fee: {
        total: 0,
        paid: 0,
        pending: 0,
      },
      rent: {
        total: 0,
        paid: 0,
        pending: 0,
      },
      other: {
        total: 0,
        paid: 0,
        pending: 0,
      },
    };

    data.forEach((payment) => {
      const type = payment.payment_type || "other";
      const amount = payment.amount || 0;

      // Add to total for this payment type
      if (totals[type]) {
        totals[type].total += amount;

        // Add to paid or pending based on status
        if (payment.status === "paid" || payment.status === "advanced") {
          totals[type].paid += amount;
        } else if (
          payment.status === "pending" ||
          payment.status === "undefined"
        ) {
          totals[type].pending += amount;
        }
      } else {
        totals.other.total += amount;
        if (payment.status === "paid" || payment.status === "advanced") {
          totals.other.paid += amount;
        } else if (
          payment.status === "pending" ||
          payment.status === "undefined"
        ) {
          totals.other.pending += amount;
        }
      }
    });

    return { totals, error: null };
  } catch (error: any) {
    console.error("Error calculating payment totals by type:", error);
    return { totals: null, error: error.message };
  }
};
