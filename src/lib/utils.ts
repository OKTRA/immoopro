
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'FCFA') {
  return `${amount.toLocaleString()} ${currency}`;
}

export function generateUniqueId(prefix: string = ''): string {
  // Generate a timestamp-based unique ID
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${randomStr}`;
}
