
import { fixPropertyStatus, syncAllPropertiesStatus } from '../tenant/leaseService';

/**
 * Fix the status of a single property
 */
export const fixSinglePropertyStatus = async (propertyId: string) => {
  if (!propertyId) {
    console.error("No property ID provided");
    return { success: false, error: "ID de propriété manquant" };
  }
  
  try {
    console.log(`Fixing status for property ${propertyId}`);
    const result = await fixPropertyStatus(propertyId);
    
    // Ensure we always return a consistent result format with both message and error properties
    return {
      success: result.success,
      message: 'message' in result ? result.message : 'Statut de la propriété mis à jour avec succès',
      error: result.error
    };
  } catch (error: any) {
    console.error(`Error fixing property status:`, error);
    return { success: false, message: null, error: error.message };
  }
};

/**
 * Fix the status of all properties in an agency
 */
export const fixAgencyPropertiesStatus = async (agencyId: string) => {
  if (!agencyId) {
    console.error("No agency ID provided");
    return { success: false, error: "ID d'agence manquant" };
  }
  
  try {
    console.log(`Fixing status for all properties in agency ${agencyId}`);
    const result = await syncAllPropertiesStatus(agencyId);
    
    // Ensure consistent result format
    return {
      success: result.success,
      message: 'message' in result ? result.message : 'Statuts des propriétés mis à jour avec succès',
      error: result.error
    };
  } catch (error: any) {
    console.error(`Error fixing agency properties status:`, error);
    return { success: false, message: null, error: error.message };
  }
};

/**
 * Fix our specific property (for the immediate issue)
 */
export const fixTargetProperty = async () => {
  const targetPropertyId = '6dd1f1b5-8117-48be-8135-94dc036960b9';
  return await fixSinglePropertyStatus(targetPropertyId);
};
