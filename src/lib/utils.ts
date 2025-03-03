
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency
 * @param value - The number to format
 * @param currency - The currency code (default: EUR)
 * @param locale - The locale to use for formatting (default: fr-FR)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number, 
  currency: string = "EUR", 
  locale: string = "fr-FR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
