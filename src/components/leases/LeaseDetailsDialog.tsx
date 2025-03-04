
import React from 'react';
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, FileText } from "lucide-react";

interface LeaseData {
  id: string;
  tenant_id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  status: string;
  tenant?: {
    first_name: string;
    last_name: string;
  };
  property?: {
    title: string;
  };
}

interface LeaseDetailsDialogProps {
  lease: LeaseData | null;
  isOpen: boolean;
  onClose: () => void;
  onViewPayments: (leaseId: string) => void;
}

const LeaseDetailsDialog: React.FC<LeaseDetailsDialogProps> = ({ 
  lease, 
  isOpen, 
  onClose,
  onViewPayments 
}) => {
  if (!lease) return null;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  const getStatusLabel = (status: string) => {
    return status === 'active' ? 'Actif' : 
           status === 'pending' ? 'En attente' : 
           status === 'expired' ? 'Expiré' : status;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Détails du bail
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Propriété</h4>
              <p className="text-base">{lease.property?.title || "Propriété non spécifiée"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Locataire</h4>
              <p className="text-base">
                {lease.tenant ? `${lease.tenant.first_name} ${lease.tenant.last_name}` : "Non assigné"}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Date de début</h4>
              <p className="text-base">
                {lease.start_date ? format(new Date(lease.start_date), 'dd/MM/yyyy') : "Non défini"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Date de fin</h4>
              <p className="text-base">
                {lease.end_date ? format(new Date(lease.end_date), 'dd/MM/yyyy') : "Non défini"}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Loyer mensuel</h4>
              <p className="text-base font-semibold">{formatCurrency(lease.monthly_rent)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Dépôt de garantie</h4>
              <p className="text-base">{formatCurrency(lease.security_deposit)}</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Statut</h4>
            <p className="text-base">{getStatusLabel(lease.status)}</p>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button 
            variant="default" 
            onClick={() => onViewPayments(lease.id)}
          >
            <CreditCard className="h-4 w-4 mr-2" /> Voir les paiements
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaseDetailsDialog;
