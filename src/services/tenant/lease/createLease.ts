import { supabase } from "@/lib/supabase";
import { ApartmentLease } from "@/assets/types";
import { createInitialPayments } from "./paymentUtils";

/**
 * Create a new lease
 */
export const createLease = async (leaseData: Omit<ApartmentLease, "id">) => {
  try {
    console.log("Creating lease with data:", leaseData);

    // First check if the property is available
    const { data: propertyData, error: propertyCheckError } = await supabase
      .from("properties")
      .select("status, agency_fees")
      .eq("id", leaseData.propertyId)
      .single();

    if (propertyCheckError) {
      console.error("Error checking property status:", propertyCheckError);
      throw propertyCheckError;
    }

    if (propertyData && propertyData.status !== "available") {
      throw new Error(
        `Cannot create lease: Property is not available (current status: ${propertyData.status})`,
      );
    }

    // Convert data to match the actual database column names in the leases table
    const dataToInsert = {
      property_id: leaseData.propertyId,
      tenant_id: leaseData.tenantId,
      start_date: leaseData.startDate,
      end_date: leaseData.endDate,
      payment_start_date: leaseData.paymentStartDate,
      monthly_rent: leaseData.monthly_rent,
      security_deposit: leaseData.security_deposit,
      payment_day: leaseData.payment_day,
      payment_frequency: leaseData.payment_frequency,
      is_active: true, // Always set to true as per the updated function
      signed_by_tenant: true, // Always set to true as per the updated function
      signed_by_owner: true, // Always set to true as per the updated function
      has_renewal_option: leaseData.has_renewal_option,
      lease_type: leaseData.lease_type,
      special_conditions: leaseData.special_conditions,
      status: "active", // Always set to 'active' as per the updated function
    };

    console.log("Data to insert:", dataToInsert);

    // Use RPC to create lease, property update, and initial payments in a transaction
    const { data: lease, error } = await supabase.rpc(
      "create_lease_with_payments",
      {
        lease_data: dataToInsert,
        property_id: leaseData.propertyId,
        new_property_status: "rented", // Changed from 'occupied' to 'rented'
        agency_fees: propertyData.agency_fees || 0,
      },
    );

    if (error) {
      console.error("Supabase error creating lease:", error);

      // Fallback to regular insert if the RPC doesn't exist
      if (error.message.includes("does not exist")) {
        console.log("Fallback to non-transactional operation");

        // Insert the lease with active status
        const leaseToInsert = {
          ...dataToInsert,
          is_active: true,
          signed_by_tenant: true,
          signed_by_owner: true,
          status: "active",
        };

        const { data, error: insertError } = await supabase
          .from("leases")
          .insert([leaseToInsert])
          .select()
          .single();

        if (insertError) {
          console.error("Error creating lease:", insertError);
          throw insertError;
        }

        // Create initial payments manually using the lease start date
        await createInitialPayments(
          data.id,
          leaseData.security_deposit || 0,
          propertyData.agency_fees || 0,
          true, // Mark as paid
          data.start_date, // Use lease start date
        );

        // Record agency fee as a gain for the agency
        if (propertyData.agency_fees && propertyData.agency_fees > 0) {
          try {
            // Get the agency_id from the property
            const { data: propertyWithAgency } = await supabase
              .from("properties")
              .select("agency_id")
              .eq("id", leaseData.propertyId)
              .single();

            await supabase.from("agency_fees").insert({
              lease_id: data.id,
              property_id: leaseData.propertyId,
              agency_id: propertyWithAgency?.agency_id,
              amount: propertyData.agency_fees,
              date: new Date().toISOString().split("T")[0],
              status: "paid",
              notes: "Frais d'agence pour la création du bail",
            });
            console.log(
              `Agency fee of ${propertyData.agency_fees} recorded for lease ${data.id}`,
            );
          } catch (agencyFeeError) {
            console.error(
              "Error recording agency fee (table may not exist):",
              agencyFeeError,
            );
            // Continue anyway, we successfully created the lease
          }
        }

        // Update the property status to rented
        const { error: updateError } = await supabase
          .from("properties")
          .update({ status: "rented" })
          .eq("id", leaseData.propertyId);

        if (updateError) {
          console.error("Error updating property status:", updateError);
          // Continue anyway, we successfully created the lease
        }

        return { lease: data, error: null };
      }

      throw error;
    }

    // Record agency fee as a gain for the agency if using RPC
    if (lease && propertyData.agency_fees && propertyData.agency_fees > 0) {
      try {
        // Get the agency_id from the property
        const { data: propertyWithAgency } = await supabase
          .from("properties")
          .select("agency_id")
          .eq("id", leaseData.propertyId)
          .single();

        await supabase.from("agency_fees").insert({
          lease_id: lease.id,
          property_id: leaseData.propertyId,
          agency_id: propertyWithAgency?.agency_id,
          amount: propertyData.agency_fees,
          date: new Date().toISOString().split("T")[0],
          status: "paid",
          notes: "Frais d'agence pour la création du bail",
        });
        console.log(
          `Agency fee of ${propertyData.agency_fees} recorded for lease ${lease.id}`,
        );
      } catch (agencyFeeError) {
        console.error(
          "Error recording agency fee (table may not exist):",
          agencyFeeError,
        );
        // Continue anyway, we successfully created the lease
      }
    }

    return { lease, error: null };
  } catch (error: any) {
    console.error("Error creating lease:", error);
    return { lease: null, error: error.message };
  }
};
