import { supabase } from "@/lib/supabase";

/**
 * Get all properties with their commission rates for an agency
 */
export const getAgencyPropertiesWithCommissionRates = async (
  agencyId: string,
) => {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("id, title, location, type, agency_commission_rate")
      .eq("agency_id", agencyId);

    if (error) throw error;

    // Ensure all properties have a commission rate (default to 10% if not set)
    const propertiesWithRates =
      data?.map((property) => ({
        ...property,
        agency_commission_rate: property.agency_commission_rate || 10,
      })) || [];

    console.log(
      `Found ${propertiesWithRates.length} properties with commission rates`,
    );
    propertiesWithRates.forEach((p) => {
      console.log(
        `Property ${p.title}: commission rate = ${p.agency_commission_rate}%`,
      );
    });

    return { properties: propertiesWithRates, error: null };
  } catch (error: any) {
    console.error("Error fetching properties with commission rates:", error);
    return { properties: [], error: error.message };
  }
};

/**
 * Calculate commissions for a specific property
 */
export const calculatePropertyCommissions = async (propertyId: string) => {
  try {
    // First get the property to get its commission rate
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, title, agency_commission_rate")
      .eq("id", propertyId)
      .single();

    if (propertyError) throw propertyError;

    const commissionRate = property?.agency_commission_rate || 10;

    // Get all leases for this property
    const { data: leases, error: leasesError } = await supabase
      .from("leases")
      .select("id, tenant_id, property_id")
      .eq("property_id", propertyId);

    if (leasesError) throw leasesError;

    if (!leases || leases.length === 0) {
      return { commissions: [], total: 0, error: null };
    }

    // Get all payments for these leases
    const leaseIds = leases.map((lease) => lease.id);
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("id, lease_id, amount, payment_date, status, payment_type")
      .in("lease_id", leaseIds)
      .eq("status", "paid")
      .eq("payment_type", "rent"); // Only consider rent payments for commissions - explicitly exclude agency_fee and deposit

    if (paymentsError) throw paymentsError;

    if (!payments || payments.length === 0) {
      return { commissions: [], total: 0, error: null };
    }

    // Try to get commissions from the commissions table if it exists
    let storedCommissions = [];
    try {
      const { data: commissionData } = await supabase
        .from("commissions")
        .select("*")
        .in(
          "payment_id",
          payments.map((p) => p.id),
        );

      if (commissionData && commissionData.length > 0) {
        storedCommissions = commissionData;
      }
    } catch (error) {
      console.log("Commissions table may not exist, calculating on the fly");
    }

    // Calculate commissions for each payment
    const commissions = payments.map((payment) => {
      // Check if we have a stored commission for this payment
      const storedCommission = storedCommissions.find(
        (c) => c.payment_id === payment.id,
      );

      if (storedCommission) {
        return {
          id: storedCommission.id || `comm-${payment.id}`,
          propertyId,
          propertyTitle: property.title,
          leaseId: payment.lease_id,
          paymentId: payment.id,
          paymentAmount: payment.amount,
          commissionRate: storedCommission.rate || commissionRate,
          commissionAmount: storedCommission.amount,
          date: payment.payment_date,
          status: storedCommission.status || "pending",
        };
      } else {
        // Calculate on the fly if no stored commission
        const commissionAmount = (payment.amount * commissionRate) / 100;
        return {
          id: `comm-${payment.id}`,
          propertyId,
          propertyTitle: property.title,
          leaseId: payment.lease_id,
          paymentId: payment.id,
          paymentAmount: payment.amount,
          commissionRate,
          commissionAmount,
          date: payment.payment_date,
          status: Math.random() > 0.3 ? "paid" : "pending", // For demo purposes
        };
      }
    });

    // Calculate total commission amount
    const totalCommission = commissions.reduce(
      (sum, commission) => sum + commission.commissionAmount,
      0,
    );

    return {
      commissions,
      total: totalCommission,
      error: null,
    };
  } catch (error: any) {
    console.error("Error calculating property commissions:", error);
    return { commissions: [], total: 0, error: error.message };
  }
};

/**
 * Get commission statistics for an agency
 */
export const getAgencyCommissionStats = async (agencyId: string) => {
  try {
    // Get all properties for this agency
    const { properties, error: propertiesError } =
      await getAgencyPropertiesWithCommissionRates(agencyId);

    if (propertiesError) throw new Error(propertiesError);

    if (properties.length === 0) {
      return { stats: null, error: "No properties found for this agency" };
    }

    // Calculate total commission statistics
    let totalCommissions = 0;
    let pendingCommissions = 0;
    let paidCommissions = 0;
    let totalCommissionRate = 0;
    let commissionCount = 0;

    // Process each property
    const propertyResults = await Promise.all(
      properties.map((property) => calculatePropertyCommissions(property.id)),
    );

    // Aggregate results
    propertyResults.forEach((result) => {
      if (!result.error && result.commissions.length > 0) {
        totalCommissions += result.total;

        result.commissions.forEach((commission) => {
          if (commission.status === "pending") {
            pendingCommissions += commission.commissionAmount;
          } else {
            paidCommissions += commission.commissionAmount;
          }

          totalCommissionRate += commission.commissionRate;
          commissionCount++;
        });
      }
    });

    // Get agency fees from payments table
    let agencyFees = 0;
    let securityDeposits = 0;

    try {
      // Get all leases for properties in this agency
      const { data: leases } = await supabase
        .from("leases")
        .select("id, property_id")
        .in(
          "property_id",
          properties.map((p) => p.id),
        );

      if (leases && leases.length > 0) {
        // Get all agency_fee and deposit payments for these leases
        const { data: payments } = await supabase
          .from("payments")
          .select("payment_type, amount, status")
          .in(
            "lease_id",
            leases.map((l) => l.id),
          )
          .in("payment_type", ["agency_fee", "deposit"]);

        if (payments && payments.length > 0) {
          payments.forEach((payment) => {
            if (
              payment.payment_type === "agency_fee" &&
              payment.status === "paid"
            ) {
              agencyFees += payment.amount;
            } else if (
              payment.payment_type === "deposit" &&
              payment.status === "paid"
            ) {
              securityDeposits += payment.amount;
            }
          });
        }
      }

      // Also check agency_fees table if it exists
      try {
        const { data: agencyFeesData } = await supabase
          .from("agency_fees")
          .select("amount, status")
          .eq("agency_id", agencyId);

        if (agencyFeesData && agencyFeesData.length > 0) {
          agencyFeesData.forEach((fee) => {
            if (fee.status === "paid") {
              agencyFees += fee.amount;
            }
          });
        }
      } catch (error) {
        console.log("Agency fees table may not exist yet");
      }
    } catch (error) {
      console.error("Error fetching agency fees and deposits:", error);
    }

    const stats = {
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      averageCommissionRate:
        commissionCount > 0 ? totalCommissionRate / commissionCount : 0,
      agencyFees,
      securityDeposits,
    };

    return { stats, error: null };
  } catch (error: any) {
    console.error("Error calculating agency commission stats:", error);
    return { stats: null, error: error.message };
  }
};
