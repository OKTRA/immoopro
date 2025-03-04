
import { supabase } from '@/lib/supabase';
import { Property } from '@/assets/types';
import { formatPropertyToDb } from './propertyUtils';

// Function to create a new property
export const createProperty = async (propertyData: any) => {
  try {
    console.log('Creating property with data:', propertyData);
    
    // Handle owner data if provided
    let propertyOwnerId = null;
    if (propertyData.ownerInfo && propertyData.ownerInfo.ownerId) {
      propertyOwnerId = propertyData.ownerInfo.ownerId;
    } else if (propertyData.ownerId) {
      propertyOwnerId = propertyData.ownerId;
    }
    
    // Make sure new properties have a default status of 'available'
    if (!propertyData.status) {
      propertyData.status = 'available';
    }
    
    const dbData = formatPropertyToDb(propertyData, propertyOwnerId);
    
    const { data, error } = await supabase
      .from('properties')
      .insert([dbData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating property:', error);
      throw error;
    }
    
    return { property: data, error: null };
  } catch (error: any) {
    console.error('Error creating property:', error);
    return { property: null, error: error.message };
  }
};

// Function to update an existing property
export const updateProperty = async (propertyId: string, propertyData: any) => {
  try {
    console.log('Updating property with ID', propertyId, 'and data:', propertyData);
    
    // Check if we're updating status and if the property has active leases
    if (propertyData.status) {
      const { data: leases, error: leaseCheckError } = await supabase
        .from('leases')
        .select('id, is_active')
        .eq('property_id', propertyId)
        .eq('is_active', true);
        
      if (leaseCheckError) {
        console.error('Error checking for active leases:', leaseCheckError);
      } else if (leases && leases.length > 0) {
        // If there are active leases and trying to set status to 'available',
        // we should prevent this to maintain data consistency
        if (propertyData.status === 'available') {
          console.warn(`Cannot set property ${propertyId} to 'available' when it has active leases`);
          propertyData.status = 'occupied'; // Force to occupied
        }
      }
    }
    
    // Handle owner data if provided
    let propertyOwnerId = null;
    if (propertyData.ownerInfo && propertyData.ownerInfo.ownerId) {
      propertyOwnerId = propertyData.ownerInfo.ownerId;
    } else if (propertyData.ownerId) {
      propertyOwnerId = propertyData.ownerId;
    }
    
    // Convert camelCase to snake_case for database columns
    const updateData = formatPropertyToDb(propertyData, propertyOwnerId, true);

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating property:', error);
      throw error;
    }
    
    return { property: data, error: null };
  } catch (error: any) {
    console.error(`Error updating property with ID ${propertyId}:`, error);
    return { property: null, error: error.message };
  }
};

// Function to delete a property
export const deleteProperty = async (propertyId: string) => {
  try {
    // Check if the property has any active leases before deletion
    const { data: leases, error: leaseError } = await supabase
      .from('leases')
      .select('id')
      .eq('property_id', propertyId);
      
    if (leaseError) {
      console.error('Error checking for leases:', leaseError);
      throw leaseError;
    }
    
    if (leases && leases.length > 0) {
      throw new Error('Cannot delete property with active leases');
    }
    
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Error deleting property with ID ${propertyId}:`, error);
    return { success: false, error: error.message };
  }
};

// Function to check property status and update if necessary
export const syncPropertyStatus = async (propertyId: string) => {
  try {
    // Get active leases for this property
    const { data: leases, error: leaseError } = await supabase
      .from('leases')
      .select('id, is_active')
      .eq('property_id', propertyId)
      .eq('is_active', true);
      
    if (leaseError) throw leaseError;
    
    // Get current property status
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('status')
      .eq('id', propertyId)
      .single();
      
    if (propertyError) throw propertyError;
    
    // Determine correct status
    const hasActiveLeases = leases && leases.length > 0;
    const correctStatus = hasActiveLeases ? 'occupied' : 'available';
    
    // Update if status is inconsistent
    if (property && property.status !== correctStatus) {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ status: correctStatus })
        .eq('id', propertyId);
        
      if (updateError) throw updateError;
      
      console.log(`Property ${propertyId} status synchronized from ${property.status} to ${correctStatus}`);
      return { success: true, updated: true, error: null };
    }
    
    return { success: true, updated: false, error: null };
  } catch (error: any) {
    console.error(`Error synchronizing property status for ${propertyId}:`, error);
    return { success: false, updated: false, error: error.message };
  }
};
