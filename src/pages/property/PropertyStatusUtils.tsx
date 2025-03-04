
import { toast } from 'sonner';
import { fixPropertyStatus } from '@/services/tenant/leaseService';

/**
 * Utility function to automatically fix property status
 */
export const executePropertyStatusFix = async (propertyId: string) => {
  if (!propertyId) {
    console.error("No property ID provided for status fix");
    return { success: false, error: "ID de propriété non fourni" };
  }
  
  try {
    console.log(`Attempting to fix property status for property ${propertyId}`);
    const result = await fixPropertyStatus(propertyId);
    
    if (result.success) {
      console.log(`Property status fix succeeded: ${result.message}`);
      toast.success(result.message);
    } else {
      console.error(`Property status fix failed: ${result.error}`);
      toast.error(`Erreur: ${result.error}`);
    }
    
    return result;
  } catch (error: any) {
    console.error(`Error executing property status fix:`, error);
    toast.error(`Erreur lors de la correction: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Execute fix for specific property ID
 */
export const fixSpecificProperty = async (id: string) => {
  if (id === '6dd1f1b5-8117-48be-8135-94dc036960b9') {
    return executePropertyStatusFix(id);
  } else {
    console.log(`Property ID ${id} is not the target property for automatic fixing`);
    return { success: false, error: "Ce n'est pas la propriété cible" };
  }
};
