import { supabase } from "@/lib/supabase";
import { PaymentData, getPaymentFrequency } from "./types";
import { calculateAndRecordCommission } from "./paymentCore";

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
      console.log("Invalid input parameters:", {
        leaseId,
        startDate,
        endDate,
        amount,
      });
      return { error: "Invalid input parameters for payment generation" };
    }

    console.log("Generating payments with params:", {
      leaseId,
      startDate,
      endDate,
      amount,
      frequency,
      paymentType,
    });

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      console.log("Start date is after end date:", { start, end });
      return { error: "Start date must be before end date" };
    }

    // Get frequency settings based on the frequency string
    const freqSettings = getPaymentFrequency(frequency);
    const { periodUnit, periodAmount } = freqSettings;
    console.log("Using frequency settings:", freqSettings);

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

    console.log(`Generated ${paymentDates.length} payment dates`);

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
    console.log(`Found ${existingDates.length} existing payment dates`);

    const newPaymentDates = paymentDates.filter(
      (date) => !existingDates.includes(date.toISOString().split("T")[0]),
    );

    console.log(`Will generate ${newPaymentDates.length} new payments`);

    if (newPaymentDates.length === 0) {
      return { message: "No new payments to generate", paymentsGenerated: 0 };
    }

    // Create payment records
    const paymentsToInsert = newPaymentDates.map((date) => {
      const formattedDate = date.toISOString().split("T")[0];
      return {
        lease_id: leaseId,
        amount: amount,
        due_date: formattedDate,
        payment_date: null, // Set to null initially
        status: "undefined", // Set status to undefined instead of pending
        payment_type: paymentType,
        payment_method: "bank_transfer", // Default payment method
        is_auto_generated: true,
      };
    });

    console.log("First payment to insert:", paymentsToInsert[0]);

    // Insert payments in smaller batches to avoid payload size issues
    const batchSize = 50;
    const allInsertedPayments = [];

    for (let i = 0; i < paymentsToInsert.length; i += batchSize) {
      const batch = paymentsToInsert.slice(i, i + batchSize);
      console.log(
        `Inserting batch ${i / batchSize + 1} with ${batch.length} payments`,
      );

      const { data: batchData, error: batchError } = await supabase
        .from("payments")
        .insert(batch)
        .select();

      if (batchError) {
        console.error("Error generating payments batch:", batchError);
        return {
          error: `Failed to generate payments batch: ${batchError.message}`,
        };
      }

      if (batchData) {
        allInsertedPayments.push(...batchData);
      }
    }

    return {
      message: `Successfully generated ${allInsertedPayments.length} payments`,
      paymentsGenerated: allInsertedPayments.length,
      payments: allInsertedPayments,
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
    const leaseStartDate = leaseData.start_date || leaseCreationDate;

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
        payment_date: leaseCreationDate, // Use lease creation date for initial payments
        due_date: leaseStartDate, // Set due_date to lease start date for deposit
        status: "undefined", // Set status to undefined
        payment_type: "deposit",
        payment_method: "bank_transfer",
        is_auto_generated: true,
        notes: "Caution initiale",
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
        payment_date: leaseCreationDate, // Use lease creation date for initial payments
        due_date: leaseStartDate, // Set due_date to lease start date for agency fees
        status: "undefined", // Set status to undefined
        payment_type: "agency_fee",
        payment_method: "bank_transfer",
        is_auto_generated: true,
        notes: "Frais d'agence",
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
      console.log("Invalid input parameters for historical payments:", {
        leaseId,
        startDate,
        amount,
      });
      return {
        error: "Invalid input parameters for historical payment generation",
      };
    }

    // Use today as the end date for historical payments
    const today = new Date();
    const endDate = today.toISOString().split("T")[0];

    console.log(
      `Generating historical payments from ${startDate} to ${endDate} with frequency ${frequency}`,
    );

    // Validate the date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      console.error("Invalid date format for startDate:", startDate);
      return { error: "Start date must be in YYYY-MM-DD format" };
    }

    // Check if the date is valid
    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
      console.error("Invalid date value for startDate:", startDate);
      return { error: "Invalid start date" };
    }

    // Use the recurring payments function to generate historical payments
    const result = await generateRecurringPayments(
      leaseId,
      startDate,
      endDate,
      amount,
      frequency,
      "rent", // Default to rent type for historical payments
    );

    if (result.error) {
      console.error("Error from generateRecurringPayments:", result.error);
      return result; // Return the error from generateRecurringPayments
    }

    console.log(
      `Generated ${result.paymentsGenerated} payments, now marking as paid`,
    );

    // Mark all historical payments as paid except the most recent one
    if (result.payments && result.payments.length > 0) {
      const sortedPayments = [...result.payments].sort((a, b) => {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });

      // All payments except the most recent one should be marked as paid
      const paymentsToUpdate = sortedPayments.slice(0, -1).map((p) => p.id);

      if (paymentsToUpdate.length > 0) {
        console.log(`Marking ${paymentsToUpdate.length} payments as paid`);

        // Update these payments in smaller batches to avoid payload size issues
        const batchSize = 50;
        let updatedCount = 0;

        for (let i = 0; i < paymentsToUpdate.length; i += batchSize) {
          const batchIds = paymentsToUpdate.slice(i, i + batchSize);
          console.log(
            `Updating batch ${i / batchSize + 1} with ${batchIds.length} payments`,
          );

          // Update these payments to be marked as paid with payment_date set to due_date
          const { error: updateError } = await supabase
            .from("payments")
            .update({
              status: "paid", // Set to paid for historical payments
              payment_date: supabase.raw("due_date"), // Set payment_date to due_date
            })
            .in("id", batchIds);

          if (updateError) {
            console.error(
              "Error updating historical payments batch to paid status:",
              updateError,
            );
          } else {
            updatedCount += batchIds.length;
            console.log(
              `Marked ${batchIds.length} payments as paid in this batch`,
            );
          }
        }

        console.log(
          `Total marked as paid: ${updatedCount} out of ${paymentsToUpdate.length}`,
        );

        // Calculate commissions for the paid payments (rent only)
        // Process in smaller batches to avoid timeouts
        for (let i = 0; i < paymentsToUpdate.length; i += 10) {
          const batchIds = paymentsToUpdate.slice(i, i + 10);

          for (const paymentId of batchIds) {
            try {
              // Get the payment details
              const { data: payment } = await supabase
                .from("payments")
                .select("*")
                .eq("id", paymentId)
                .single();

              if (payment && payment.payment_type === "rent") {
                await calculateAndRecordCommission(
                  paymentId,
                  leaseId,
                  payment.amount,
                  "rent",
                );
              }
            } catch (commissionError) {
              console.error(
                `Error calculating commission for payment ${paymentId}:`,
                commissionError,
              );
              // Continue with other payments
            }
          }
        }

        // Fetch the updated payments to return, in batches if needed
        const allPaymentIds = result.payments.map((p) => p.id);
        let allUpdatedPayments = [];

        for (let i = 0; i < allPaymentIds.length; i += batchSize) {
          const batchIds = allPaymentIds.slice(i, i + batchSize);

          const { data: batchPayments } = await supabase
            .from("payments")
            .select("*")
            .in("id", batchIds);

          if (batchPayments) {
            allUpdatedPayments.push(...batchPayments);
          }
        }

        if (allUpdatedPayments.length > 0) {
          return {
            message: `Generated ${result.paymentsGenerated} historical payments (${updatedCount} marked as paid)`,
            paymentsGenerated: result.paymentsGenerated,
            data: allUpdatedPayments,
          };
        }
      }
    }

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
