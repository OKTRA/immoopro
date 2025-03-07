
import { supabase } from '@/lib/supabase';

/**
 * Delete a lease
 */
export const deleteLease = async (leaseId: string) => {
  try {
    // First get the property ID from the lease
    const { data: leaseData, error: leaseError } = await supabase
      .from('leases')
      .select('property_id')
      .eq('id', leaseId)
      .single();
      
    if (leaseError) throw leaseError;
    
    // Delete the lease
    const { error } = await supabase
      .from('leases')
      .delete()
      .eq('id', leaseId);

    if (error) throw error;
    
    // Update the property status to available
    const { error: updateError } = await supabase
      .from('properties')
      .update({ status: 'available' })
      .eq('id', leaseData.property_id);
      
    if (updateError) {
      console.error('Error updating property status:', updateError);
      // Return success anyway since the lease was deleted
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Error deleting lease with ID ${leaseId}:`, error);
    return { success: false, error: error.message };
  }
};
