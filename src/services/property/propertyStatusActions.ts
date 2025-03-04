
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
    return await fixPropertyStatus(propertyId);
  } catch (error: any) {
    console.error(`Error fixing property status:`, error);
    return { success: false, error: error.message };
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
    return await syncAllPropertiesStatus(agencyId);
  } catch (error: any) {
    console.error(`Error fixing agency properties status:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Fix our specific property (for the immediate issue)
 */
export const fixTargetProperty = async () => {
  const targetPropertyId = '6dd1f1b5-8117-48be-8135-94dc036960b9';
  return await fixSinglePropertyStatus(targetPropertyId);
};
