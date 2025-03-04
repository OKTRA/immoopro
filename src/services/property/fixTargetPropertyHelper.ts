
import { fixPropertyStatus } from '../tenant/leaseService';

// The target property ID that needs fixing
const TARGET_PROPERTY_ID = '6dd1f1b5-8117-48be-8135-94dc036960b9';

/**
 * Fix the specific property with ID 6dd1f1b5-8117-48be-8135-94dc036960b9
 */
export const fixTargetProperty = async () => {
  try {
    console.log(`Attempting to fix target property ${TARGET_PROPERTY_ID}`);
    const result = await fixPropertyStatus(TARGET_PROPERTY_ID);
    console.log('Fix result:', result);
    return result;
  } catch (error) {
    console.error('Error fixing target property:', error);
    throw error;
  }
};

// Execute this function directly to fix the target property
// This can be called from the browser console: 
// import { fixTargetProperty } from '@/services/property/fixTargetPropertyHelper'; fixTargetProperty();
