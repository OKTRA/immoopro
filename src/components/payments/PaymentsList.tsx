
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentData } from "@/services/paymentService";
import PaymentItem from "./PaymentItem";
import { EmptyState } from "../ui/empty-state";
import { Receipt, Plus } from "lucide-react";

interface PaymentsListProps {
  payments: PaymentData[];
  onAddPayment: () => void;
  onEditPayment: (payment: PaymentData) => void;
  onDeletePayment: (paymentId: string) => void;
}

export default function PaymentsList({ 
  payments, 
  onAddPayment, 
  onEditPayment, 
  onDeletePayment 
}: PaymentsListProps) {
  const [filter, setFilter] = useState<string>('all');
  
  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-medium">Historique des paiements</div>
        <Button onClick={onAddPayment} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Ajouter
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={filter === 'all' ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter('all')}
        >
          Tous
        </Button>
        <Button 
          variant={filter === 'completed' ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter('completed')}
          className={filter === 'completed' ? "bg-green-500 hover:bg-green-600" : ""}
        >
          Payés
        </Button>
        <Button 
          variant={filter === 'pending' ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter('pending')}
          className={filter === 'pending' ? "bg-yellow-500 hover:bg-yellow-600" : ""}
        >
          En attente
        </Button>
        <Button 
          variant={filter === 'late' ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter('late')}
          className={filter === 'late' ? "bg-red-500 hover:bg-red-600" : ""}
        >
          En retard
        </Button>
      </div>
      
      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-10 w-10 text-muted-foreground" />}
          title="Aucun paiement"
          description={
            filter === 'all' 
              ? "Aucun paiement n'a été enregistré pour ce bail."
              : `Aucun paiement avec le statut "${filter}" n'a été trouvé.`
          }
          action={
            <Button onClick={onAddPayment}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter un paiement
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <PaymentItem
              key={payment.id}
              payment={payment}
              onEdit={onEditPayment}
              onDelete={onDeletePayment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
