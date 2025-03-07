import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { PaymentFrequency } from "@/services/payment/types"
import { addDays, addMonths, addWeeks, addYears, format, isBefore, isAfter, startOfMonth, endOfMonth, getDaysInMonth } from "date-fns"

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

/**
 * Calculate the end date of a period based on frequency and start date
 */
export function calculatePeriodEndDate(startDate: Date, frequency: PaymentFrequency): Date {
  const { periodUnit, periodAmount } = frequency;
  
  switch (periodUnit) {
    case 'days':
      return addDays(startDate, periodAmount);
    case 'weeks':
      return addWeeks(startDate, periodAmount);
    case 'months':
      // For monthly payments, we calculate the actual end of the month
      if (periodUnit === 'months' && periodAmount === 1) {
        return endOfMonth(startDate);
      }
      return addMonths(startDate, periodAmount);
    case 'years':
      return addYears(startDate, periodAmount);
    default:
      return addMonths(startDate, 1); // Default to monthly
  }
}

/**
 * Calculate the next due date based on frequency, payment start date, and current date
 */
export function calculateNextDueDate(
  paymentStartDate: string | Date,
  frequency: string,
  paymentDay?: number | null,
  referenceDate: Date = new Date()
): Date {
  // Convert string dates to Date objects
  const startDate = typeof paymentStartDate === 'string' ? new Date(paymentStartDate) : paymentStartDate;
  
  // Get the payment frequency details
  const paymentFrequency = getPaymentFrequency(frequency);
  
  // Start with the reference date and calculate next due date
  let dueDate = new Date(referenceDate);
  
  if (paymentFrequency.periodUnit === 'months') {
    // For monthly, quarterly, biannually, and annual (all use months internally)
    // If payment day is specified, use it, otherwise keep the original day
    const targetDay = paymentDay || startDate.getDate();
    
    // Set to first day of current month
    dueDate.setDate(1);
    
    // If we're already past the payment day this month, move to next period
    if (referenceDate.getDate() > targetDay) {
      dueDate = addMonths(dueDate, paymentFrequency.periodAmount);
    }
    
    // Set the payment day, accounting for months with fewer days
    const daysInMonth = getDaysInMonth(dueDate);
    dueDate.setDate(Math.min(targetDay, daysInMonth));
    
    return dueDate;
  } else if (paymentFrequency.periodUnit === 'days') {
    // For daily payments
    return addDays(referenceDate, 1);
  } else if (paymentFrequency.periodUnit === 'weeks') {
    // For weekly or biweekly payments
    // Find the next occurrence of the same weekday as the start date
    const daysDiff = (7 + startDate.getDay() - referenceDate.getDay()) % 7;
    dueDate = addDays(referenceDate, daysDiff || 7); // If 0, add a full week
    
    // For biweekly, ensure we're on the correct week interval
    if (paymentFrequency.periodAmount > 1) {
      const weeksSinceStart = Math.floor(
        (dueDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      
      if (weeksSinceStart % paymentFrequency.periodAmount !== 0) {
        dueDate = addWeeks(dueDate, paymentFrequency.periodAmount - (weeksSinceStart % paymentFrequency.periodAmount));
      }
    }
    
    return dueDate;
  } else if (paymentFrequency.periodUnit === 'years') {
    // For yearly payments
    let nextDueDate = new Date(dueDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
    // If we're already past this year's due date, move to next year
    if (isAfter(referenceDate, nextDueDate)) {
      nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
    }
    
    return nextDueDate;
  }
  
  // Default case - return the calculated end date of the current period
  return calculatePeriodEndDate(referenceDate, paymentFrequency);
}

/**
 * Determine payment status based on due date, payment date, and grace period
 */
export function determinePaymentStatus(
  dueDate: string | Date | null,
  paymentDate: string | Date | null,
  gracePeriodDays: number = 5, // Grace period in days
  referenceDate: Date = new Date()
): 'paid' | 'pending' | 'late' | 'advanced' | 'undefined' {
  if (!dueDate) return 'undefined';
  
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const graceDate = addDays(dueDateObj, gracePeriodDays);
  
  // If payment date exists, it's been paid
  if (paymentDate) {
    const paymentDateObj = typeof paymentDate === 'string' ? new Date(paymentDate) : paymentDate;
    
    // Check if payment was made before due date
    if (isBefore(paymentDateObj, dueDateObj)) {
      return 'advanced'; // Paid in advance
    }
    
    return 'paid'; // Regular payment
  }
  
  // No payment yet - check if we're past the grace period
  if (isAfter(referenceDate, graceDate)) {
    return 'late'; // Past due and grace period
  }
  
  // No payment but still within grace period
  return 'pending';
}

/**
 * Get payment frequency object from string value
 */
export function getPaymentFrequency(value: string): PaymentFrequency {
  const PAYMENT_FREQUENCIES: PaymentFrequency[] = [
    { value: 'daily', label: 'Quotidien', daysInterval: 1, periodUnit: 'days', periodAmount: 1 },
    { value: 'weekly', label: 'Hebdomadaire', daysInterval: 7, periodUnit: 'weeks', periodAmount: 1 },
    { value: 'biweekly', label: 'Bi-hebdomadaire', daysInterval: 14, periodUnit: 'weeks', periodAmount: 2 },
    { value: 'monthly', label: 'Mensuel', daysInterval: 30, periodUnit: 'months', periodAmount: 1 },
    { value: 'quarterly', label: 'Trimestriel', daysInterval: 90, periodUnit: 'months', periodAmount: 3 },
    { value: 'biannually', label: 'Semestriel', daysInterval: 180, periodUnit: 'months', periodAmount: 6 },
    { value: 'annually', label: 'Annuel', daysInterval: 365, periodUnit: 'years', periodAmount: 1 },
  ];
  
  return PAYMENT_FREQUENCIES.find(f => f.value === value) || PAYMENT_FREQUENCIES[3]; // default to monthly
}

/**
 * Get translated status label
 */
export function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case 'paid':
      return 'Payé';
    case 'pending':
      return 'En cours';
    case 'late':
      return 'Retard';
    case 'advanced':
      return 'Payé en avance';
    case 'undefined':
    default:
      return 'À définir';
  }
}
