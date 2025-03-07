
import { supabase } from '@/lib/supabase';

/**
 * Get lease by ID
 */
export const getLeaseById = async (leaseId: string) => {
  try {
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        tenants:tenant_id (
          id,
          first_name,
          last_name,
          email,
          phone,
          photo_url,
          profession
        ),
        properties:property_id (
          id,
          title,
          location,
          image_url,
          type,
          agency_fees
        )
      `)
      .eq('id', leaseId)
      .single();

    if (error) throw error;
    return { lease: data, error: null };
  } catch (error: any) {
    console.error(`Error getting lease with ID ${leaseId}:`, error);
    return { lease: null, error: error.message };
  }
};
