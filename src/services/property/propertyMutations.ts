
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
