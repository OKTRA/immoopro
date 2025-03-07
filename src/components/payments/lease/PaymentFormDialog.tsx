
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PaymentForm from "@/components/payments/PaymentForm";
import { PaymentData } from "@/services/payment/types";

interface PaymentFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leaseId: string;
  monthlyRent: number;
  currentPayment: PaymentData | null;
  onSubmit: (data: PaymentData) => Promise<void>;
  isSubmitting: boolean;
}

export default function PaymentFormDialog({
  isOpen,
  onOpenChange,
  leaseId,
  monthlyRent,
  currentPayment,
  onSubmit,
  isSubmitting
}: PaymentFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {currentPayment ? 'Modifier le paiement' : 'Ajouter un paiement'}
          </DialogTitle>
          <DialogDescription>
            {currentPayment 
              ? 'Modifiez les détails du paiement ci-dessous.'
              : 'Entrez les détails du paiement ci-dessous.'}
          </DialogDescription>
        </DialogHeader>
        
        <PaymentForm
          leaseId={leaseId}
          monthlyRent={monthlyRent}
          initialData={currentPayment || undefined}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
