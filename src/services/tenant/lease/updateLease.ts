
import { supabase } from '@/lib/supabase';
import { ApartmentLease } from '@/assets/types';

/**
 * Update a lease
 */
export const updateLease = async (id: string, leaseData: Partial<ApartmentLease>) => {
  try {
    // Convert camelCase to snake_case for database column names
    const updateData: any = {};
    
    if (leaseData.propertyId !== undefined) updateData.property_id = leaseData.propertyId;
    if (leaseData.tenantId !== undefined) updateData.tenant_id = leaseData.tenantId;
    if (leaseData.startDate !== undefined) updateData.start_date = leaseData.startDate;
    if (leaseData.endDate !== undefined) updateData.end_date = leaseData.endDate;
    if (leaseData.paymentStartDate !== undefined) updateData.payment_start_date = leaseData.paymentStartDate;
    if (leaseData.monthly_rent !== undefined) updateData.monthly_rent = leaseData.monthly_rent;
    if (leaseData.security_deposit !== undefined) updateData.security_deposit = leaseData.security_deposit;
    if (leaseData.payment_day !== undefined) updateData.payment_day = leaseData.payment_day;
    if (leaseData.payment_frequency !== undefined) updateData.payment_frequency = leaseData.payment_frequency;
    if (leaseData.is_active !== undefined) updateData.is_active = leaseData.is_active;
    if (leaseData.signed_by_tenant !== undefined) updateData.signed_by_tenant = leaseData.signed_by_tenant;
    if (leaseData.signed_by_owner !== undefined) updateData.signed_by_owner = leaseData.signed_by_owner;
    if (leaseData.has_renewal_option !== undefined) updateData.has_renewal_option = leaseData.has_renewal_option;
    if (leaseData.lease_type !== undefined) updateData.lease_type = leaseData.lease_type;
    if (leaseData.special_conditions !== undefined) updateData.special_conditions = leaseData.special_conditions;
    if (leaseData.status !== undefined) updateData.status = leaseData.status;
    
    console.log('Updating lease with ID', id, 'and data:', updateData);

    // If we're changing the active status, we need to update the property status too
    if (leaseData.is_active !== undefined) {
      try {
        // Get the property ID from the lease
        const { data: leaseData, error: leaseError } = await supabase
          .from('leases')
          .select('property_id')
          .eq('id', id)
          .single();
          
        if (leaseError) throw leaseError;
        
        // Update the property status based on the is_active flag in the updateData
        const propertyStatus = updateData.is_active ? 'occupied' : 'available';
        const { error: updateError } = await supabase
          .from('properties')
          .update({ status: propertyStatus })
          .eq('id', leaseData.property_id);
          
        if (updateError) {
          console.error('Error updating property status:', updateError);
          // Continue with the lease update anyway
        }
      } catch (error) {
        console.error('Error updating property status:', error);
        // Continue with the lease update anyway
      }
    }

    const { data, error } = await supabase
      .from('leases')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lease:', error);
      throw error;
    }
    
    return { lease: data, error: null };
  } catch (error: any) {
    console.error(`Error updating lease with ID ${id}:`, error);
    return { lease: null, error: error.message };
  }
};
