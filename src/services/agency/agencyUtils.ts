
import { Agency } from '@/assets/types';

/**
 * Utility functions for agency data
 */

/**
 * Format agency address for display
 */
export const formatAgencyAddress = (location: string): string => {
  if (!location) return 'Adresse non spécifiée';
  return location.trim();
};

/**
 * Calculate agency rating display (rounded to nearest 0.5)
 */
export const calculateDisplayRating = (rating: number): number => {
  if (!rating) return 0;
  return Math.round(rating * 2) / 2;
};

/**
 * Get agency initial from name (for avatar fallback)
 */
export const getAgencyInitial = (name: string): string => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

/**
 * Validate agency data for form submission
 */
export const validateAgencyData = (data: Partial<Agency>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.name) {
    errors.push('Le nom de l\'agence est requis');
  }
  
  if (!data.location) {
    errors.push('L\'adresse de l\'agence est requise');
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('L\'email n\'est pas valide');
  }
  
  if (data.website && !data.website.startsWith('http')) {
    errors.push('L\'URL du site web doit commencer par http:// ou https://');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
