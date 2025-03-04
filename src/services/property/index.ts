
// Re-export all property service functions for backward compatibility
export * from './propertyQueries';
export * from './propertyMutations';
export * from './propertyOwners';
export * from './propertyMedia';

// Export agency-specific property functions
export { getPropertiesByAgencyId } from '../agency/agencyPropertiesService';
