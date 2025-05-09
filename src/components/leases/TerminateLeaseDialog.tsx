import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TerminateLeaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leaseId: string;
  propertyId: string;
  securityDeposit: number;
  onConfirm: (data: { damagesAmount: number; notes: string }) => Promise<void>;
  isSubmitting: boolean;
}

export default function TerminateLeaseDialog({
  isOpen,
  onOpenChange,
  leaseId,
  propertyId,
  securityDeposit,
  onConfirm,
  isSubmitting,
}: TerminateLeaseDialogProps) {
  const [damagesAmount, setDamagesAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({
      damagesAmount: Number(damagesAmount) || 0,
      notes,
    });
  };

  const depositToReturn = Math.max(
    0,
    securityDeposit - (Number(damagesAmount) || 0),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Clôturer le bail</DialogTitle>
          <DialogDescription>
            Complétez l'état des lieux pour finaliser la clôture du bail.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="securityDeposit">Montant de la caution</Label>
            <Input
              id="securityDeposit"
              value={securityDeposit}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="damagesAmount">
              Montant des dommages à déduire (si applicable)
            </Label>
            <Input
              id="damagesAmount"
              type="number"
              min="0"
              max={securityDeposit}
              step="0.01"
              value={damagesAmount}
              onChange={(e) => setDamagesAmount(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes sur l'état des lieux</Label>
            <Textarea
              id="notes"
              placeholder="Décrivez l'état du bien et les éventuels dommages constatés..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="bg-muted p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span>Caution à rembourser:</span>
              <span className="font-semibold">
                {formatCurrency(depositToReturn, "FCFA")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Montant retenu:</span>
              <span className="font-semibold">
                {formatCurrency(Number(damagesAmount) || 0, "FCFA")}
              </span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Attention</h4>
                <p className="text-sm text-yellow-700">
                  Cette action est irréversible. La propriété sera marquée comme
                  disponible et tous les paiements futurs seront annulés.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Confirmer et clôturer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
