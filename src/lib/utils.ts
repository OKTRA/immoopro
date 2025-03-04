
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency
 * @param value - The number to format
 * @param currency - The currency code (default: FCFA)
 * @param locale - The locale to use for formatting (default: fr-FR)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number, 
  currency: string = "FCFA", 
  locale: string = "fr-FR"
): string {
  // Pour FCFA, nous utilisons une méthode personnalisée car Intl.NumberFormat 
  // ne gère pas directement l'affichage du FCFA comme nous le souhaitons
  if (currency === "FCFA") {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + " FCFA";
  }
  
  // Pour les autres devises, utiliser la méthode standard
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
