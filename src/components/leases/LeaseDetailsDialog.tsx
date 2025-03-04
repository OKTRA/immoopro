
import React from 'react';
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
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
  properties?: {
    title: string;
  };
  tenants?: {
    first_name: string;
    last_name: string;
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

  // Détermine le nom de la propriété en tenant compte des différentes structures de données possibles
  const getPropertyTitle = () => {
    if (lease.property?.title) return lease.property.title;
    if (lease.properties?.title) return lease.properties.title;
    return "Propriété non spécifiée";
  };

  // Détermine le nom du locataire en tenant compte des différentes structures de données possibles
  const getTenantName = () => {
    if (lease.tenant && lease.tenant.first_name) {
      return `${lease.tenant.first_name} ${lease.tenant.last_name}`;
    }
    if (lease.tenants && lease.tenants.first_name) {
      return `${lease.tenants.first_name} ${lease.tenants.last_name}`;
    }
    return "Non assigné";
  };

  // Formate correctement les dates ou retourne "Non défini" si la date est invalide
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Non défini";
    
    try {
      const date = new Date(dateString);
      // Vérifie si la date est valide
      if (isNaN(date.getTime())) return "Non défini";
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return "Non défini";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Détails du bail
          </DialogTitle>
          <DialogDescription>
            Informations sur le contrat de location
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Propriété</h4>
              <p className="text-base">{getPropertyTitle()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Locataire</h4>
              <p className="text-base">{getTenantName()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Date de début</h4>
              <p className="text-base">{formatDate(lease.start_date)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Date de fin</h4>
              <p className="text-base">{formatDate(lease.end_date)}</p>
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
