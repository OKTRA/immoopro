
import { useState } from "react";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentData } from "@/services/payment";
import { Plus } from "lucide-react";
import { 
  Table,
  TableBody,
} from "@/components/ui/table";

import { usePaymentsSorting } from "./hooks/usePaymentsSorting";
import PaymentsTableHeader from "./list/PaymentsTableHeader";
import PaymentRow from "./list/PaymentRow";
import EmptyPaymentsList from "./list/EmptyPaymentsList";

interface PaymentsListProps {
  payments: PaymentData[];
  onAddPayment: () => void;
  onEditPayment: (payment: PaymentData) => void;
  onDeletePayment: (paymentId: string) => void;
  selectedPaymentIds?: string[];
  onPaymentSelect?: (paymentId: string, selected: boolean) => void;
}

export default function PaymentsList({ 
  payments,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
  selectedPaymentIds = [],
  onPaymentSelect
}: PaymentsListProps) {
  const { sortedPayments, sortField, sortDirection, handleSort } = usePaymentsSorting(payments);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liste des paiements</CardTitle>
          <CardDescription>
            {payments.length} paiement{payments.length !== 1 ? "s" : ""} au total
            {selectedPaymentIds.length > 0 && ` (${selectedPaymentIds.length} sélectionné${selectedPaymentIds.length > 1 ? 's' : ''})`}
          </CardDescription>
        </div>
        <Button onClick={onAddPayment}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter un paiement
        </Button>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <EmptyPaymentsList />
        ) : (
          <Table>
            <PaymentsTableHeader 
              sortField={sortField} 
              sortDirection={sortDirection} 
              onSort={handleSort}
              showSelectionColumn={!!onPaymentSelect}
            />
            <TableBody>
              {sortedPayments.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  onEditPayment={onEditPayment}
                  onDeletePayment={onDeletePayment}
                  showSelectionColumn={!!onPaymentSelect}
                  isSelected={selectedPaymentIds.includes(payment.id || '')}
                  onPaymentSelect={onPaymentSelect}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
