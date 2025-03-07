
import { supabase } from '@/lib/supabase';
import { ApartmentLease } from '@/assets/types';

/**
 * Get leases for a property
 */
export const getLeasesByPropertyId = async (propertyId: string) => {
  try {
    console.log(`Fetching leases for property: ${propertyId}`);
    
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        tenants:tenant_id (
          first_name,
          last_name
        ),
        properties:property_id (
          title,
          location
        )
      `)
      .eq('property_id', propertyId);

    if (error) throw error;
    
    console.log(`Found ${data?.length || 0} leases for property ${propertyId}`);
    return { leases: data, error: null };
  } catch (error: any) {
    console.error(`Error getting leases for property ${propertyId}:`, error);
    return { leases: [], error: error.message };
  }
};

/**
 * Get leases for an agency
 */
export const getLeasesByAgencyId = async (agencyId: string) => {
  try {
    console.log(`Fetching leases for agency: ${agencyId}`);
    
    // First get all properties for this agency
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('agency_id', agencyId);

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      throw propertiesError;
    }
    
    console.log(`Found ${properties?.length || 0} properties for agency ${agencyId}`);
    
    if (!properties || properties.length === 0) {
      return { leases: [], error: null };
    }

    const propertyIds = properties.map(p => p.id);
    console.log('Property IDs:', propertyIds);

    // Then get all leases for these properties
    const { data: leases, error: leasesError } = await supabase
      .from('leases')
      .select(`
        *,
        tenants:tenant_id (
          first_name,
          last_name
        ),
        properties:property_id (
          title,
          location
        )
      `)
      .in('property_id', propertyIds);

    if (leasesError) {
      console.error('Error fetching leases:', leasesError);
      throw leasesError;
    }
    
    console.log(`Found ${leases?.length || 0} leases for agency ${agencyId}`);
    return { leases, error: null };
  } catch (error: any) {
    console.error(`Error getting leases for agency ${agencyId}:`, error);
    return { leases: [], error: error.message };
  }
};

/**
 * Get leases by tenant ID
 */
export const getLeasesByTenantId = async (tenantId: string) => {
  try {
    const { data, error } = await supabase
      .from('apartment_leases')
      .select(`
        *,
        apartments:apartment_id (
          id,
          unit_number,
          floor_plan,
          bedrooms,
          bathrooms,
          monthly_rent,
          property_id,
          properties:property_id (
            id,
            title,
            location,
            image_url
          )
        )
      `)
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return { leases: data, error: null };
  } catch (error: any) {
    console.error(`Error getting leases for tenant ${tenantId}:`, error);
    return { leases: [], error: error.message };
  }
};

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

/**
 * Create a new lease
 */
export const createLease = async (leaseData: Omit<ApartmentLease, 'id'>) => {
  try {
    console.log('Creating lease with data:', leaseData);
    
    // First check if the property is available
    const { data: propertyData, error: propertyCheckError } = await supabase
      .from('properties')
      .select('status, agency_fees')
      .eq('id', leaseData.propertyId)
      .single();
    
    if (propertyCheckError) {
      console.error('Error checking property status:', propertyCheckError);
      throw propertyCheckError;
    }
    
    if (propertyData && propertyData.status !== 'available') {
      throw new Error(`Cannot create lease: Property is not available (current status: ${propertyData.status})`);
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
      status: 'active' // Always set to 'active' as per the updated function
    };

    console.log('Data to insert:', dataToInsert);

    // Use RPC to create lease, property update, and initial payments in a transaction
    const { data: lease, error } = await supabase.rpc('create_lease_with_payments', { 
      lease_data: dataToInsert,
      property_id: leaseData.propertyId,
      new_property_status: 'rented', // Changed from 'occupied' to 'rented'
      agency_fees: propertyData.agency_fees || 0
    });

    if (error) {
      console.error('Supabase error creating lease:', error);
      
      // Fallback to regular insert if the RPC doesn't exist
      if (error.message.includes('does not exist')) {
        console.log('Fallback to non-transactional operation');
        
        // Insert the lease with active status
        const leaseToInsert = {
          ...dataToInsert,
          is_active: true,
          signed_by_tenant: true,
          signed_by_owner: true,
          status: 'active'
        };
        
        const { data, error: insertError } = await supabase
          .from('leases')
          .insert([leaseToInsert])
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating lease:', insertError);
          throw insertError;
        }
        
        // Create initial payments manually using the lease start date
        await createInitialPayments(
          data.id, 
          leaseData.security_deposit || 0, 
          propertyData.agency_fees || 0,
          true, // Mark as paid
          data.start_date // Use lease start date
        );
        
        // Update the property status to rented
        const { error: updateError } = await supabase
          .from('properties')
          .update({ status: 'rented' })
          .eq('id', leaseData.propertyId);
          
        if (updateError) {
          console.error('Error updating property status:', updateError);
          // Continue anyway, we successfully created the lease
        }
        
        return { lease: data, error: null };
      }
      
      throw error;
    }
    return { lease, error: null };
  } catch (error: any) {
    console.error('Error creating lease:', error);
    return { lease: null, error: error.message };
  }
};

/**
 * Create initial payments for a new lease (security deposit and agency fees)
 */
const createInitialPayments = async (
  leaseId: string, 
  securityDeposit: number, 
  agencyFees: number, 
  asPaid = false,
  paymentDate?: string // Add parameter for payment date
) => {
  try {
    // Use provided payment date or default to today
    const effectiveDate = paymentDate || new Date().toISOString().split('T')[0];
    const payments = [];
    
    // Add security deposit payment
    if (securityDeposit > 0) {
      payments.push({
        lease_id: leaseId,
        amount: securityDeposit,
        payment_date: effectiveDate,
        due_date: effectiveDate,
        payment_method: 'bank_transfer',
        status: asPaid ? 'paid' : 'pending',
        payment_type: 'deposit',
        is_auto_generated: true,
        notes: 'Caution initiale'
      });
    }
    
    // Add agency fees payment if applicable
    if (agencyFees > 0) {
      payments.push({
        lease_id: leaseId,
        amount: agencyFees,
        payment_date: effectiveDate,
        due_date: effectiveDate,
        payment_method: 'bank_transfer',
        status: asPaid ? 'paid' : 'pending',
        payment_type: 'agency_fee',
        is_auto_generated: true,
        notes: "Frais d'agence"
      });
    }
    
    if (payments.length > 0) {
      const { error } = await supabase
        .from('payments')
        .insert(payments);
        
      if (error) {
        console.error('Error creating initial payments:', error);
        throw error;
      }
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error creating initial payments:', error);
    return { success: false, error: error.message };
  }
};

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
