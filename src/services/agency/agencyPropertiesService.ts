import { supabase } from "@/lib/supabase";

/**
 * Get properties by agency ID
 */
export const getPropertiesByAgencyId = async (
  agencyId: string,
  limit = 10,
  offset = 0,
) => {
  try {
    console.log(
      `Fetching properties for agency ${agencyId}, limit: ${limit}, offset: ${offset}`,
    );
    const { data, error, count } = await supabase
      .from("properties")
      .select("*", { count: "exact" })
      .eq("agency_id", agencyId)
      .range(offset, offset + limit - 1);

    if (error) throw error;

    console.log(`Found ${count} properties for agency ${agencyId}:`, data);
    return { properties: data, count, error: null };
  } catch (error: any) {
    console.error(`Error getting properties for agency ${agencyId}:`, error);
    return { properties: [], count: 0, error: error.message };
  }
};
