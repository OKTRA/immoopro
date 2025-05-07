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
      .select("id, lease_id, amount, payment_date, status")
      .in("lease_id", leaseIds)
      .eq("status", "paid");

    if (paymentsError) throw paymentsError;

    if (!payments || payments.length === 0) {
      return { commissions: [], total: 0, error: null };
    }

    // Calculate commissions for each payment
    const commissions = payments.map((payment) => {
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

    const stats = {
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      averageCommissionRate:
        commissionCount > 0 ? totalCommissionRate / commissionCount : 0,
    };

    return { stats, error: null };
  } catch (error: any) {
    console.error("Error calculating agency commission stats:", error);
    return { stats: null, error: error.message };
  }
};
