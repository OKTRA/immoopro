
import { Building, User } from "lucide-react";

interface LeaseInfoSectionProps {
  lease: any;
}

export default function LeaseInfoSection({ lease }: LeaseInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-muted rounded-lg p-4 space-y-2">
        <div className="flex items-center">
          <Building className="h-5 w-5 mr-2 text-primary" />
          <h3 className="font-semibold">Informations sur le bail</h3>
        </div>
        <div className="text-sm grid grid-cols-2 gap-2">
          <span className="text-muted-foreground">Début:</span>
          <span>{new Date(lease.start_date).toLocaleDateString()}</span>
          
          <span className="text-muted-foreground">Fin:</span>
          <span>{new Date(lease.end_date).toLocaleDateString()}</span>
          
          <span className="text-muted-foreground">Premier paiement:</span>
          <span>{lease.payment_start_date ? new Date(lease.payment_start_date).toLocaleDateString() : new Date(lease.start_date).toLocaleDateString()}</span>
          
          <span className="text-muted-foreground">Loyer mensuel:</span>
          <span className="font-medium">{lease.monthly_rent?.toLocaleString()} FCFA</span>
          
          <span className="text-muted-foreground">Caution:</span>
          <span>{lease.security_deposit?.toLocaleString()} FCFA</span>
          
          <span className="text-muted-foreground">Fréquence:</span>
          <span className="capitalize">{lease.payment_frequency || 'Mensuelle'}</span>
          
          <span className="text-muted-foreground">Statut:</span>
          <span className="capitalize">{lease.status}</span>
        </div>
      </div>
      
      <div className="bg-muted rounded-lg p-4 space-y-2">
        <div className="flex items-center">
          <User className="h-5 w-5 mr-2 text-primary" />
          <h3 className="font-semibold">Informations sur le locataire</h3>
        </div>
        <div className="text-sm grid grid-cols-2 gap-2">
          <span className="text-muted-foreground">Nom:</span>
          <span>{lease.tenants?.first_name} {lease.tenants?.last_name}</span>
          
          <span className="text-muted-foreground">Email:</span>
          <span>{lease.tenants?.email}</span>
          
          <span className="text-muted-foreground">Téléphone:</span>
          <span>{lease.tenants?.phone}</span>
        </div>
      </div>
    </div>
  );
}
