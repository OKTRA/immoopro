
import { useState, useMemo } from 'react';
import { PaymentData } from '@/services/payment/types';

export function usePaymentsSorting(payments: PaymentData[]) {
  const [sortField, setSortField] = useState<string>("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc"); // Default to newest first
  
  // Process payments to add effective status
  const processedPayments = useMemo(() => payments.map(payment => {
    return {
      ...payment,
      effectiveStatus: payment.effectiveStatus || payment.status
    };
  }), [payments]);
  
  // Sort payments by the selected field
  const sortedPayments = useMemo(() => {
    return [...processedPayments].sort((a, b) => {
      if (sortField === "dueDate") {
        // Special handling for dates to ensure proper sorting
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      } else if (sortField === "effectiveStatus") {
        // Sort by effective status
        const statusOrder = {
          'late': 0,
          'pending': 1,
          'paid': 2,
          'advanced': 3,
          'undefined': 4
        };
        
        const aValue = statusOrder[a.effectiveStatus as keyof typeof statusOrder] ?? 4;
        const bValue = statusOrder[b.effectiveStatus as keyof typeof statusOrder] ?? 4;
        
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        // Generic sorting for other fields
        let aValue = a[sortField as keyof typeof a];
        let bValue = b[sortField as keyof typeof b];
        
        if (aValue === null || aValue === undefined) aValue = "";
        if (bValue === null || bValue === undefined) bValue = "";
        
        if (sortDirection === "asc") {
          if (aValue < bValue) return -1;
          if (aValue > bValue) return 1;
          return 0;
        } else {
          if (aValue > bValue) return -1;
          if (aValue < bValue) return 1;
          return 0;
        }
      }
    });
  }, [processedPayments, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc"); // Default to newest first when changing fields
    }
  };

  return {
    sortedPayments,
    sortField,
    sortDirection,
    handleSort
  };
}
