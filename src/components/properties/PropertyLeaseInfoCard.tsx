
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PropertyLeaseInfoCardProps {
  leases: any[];
  agencyId: string | undefined;
  propertyId: string | undefined;
  handleViewPayments: (leaseId: string) => void;
}

export default function PropertyLeaseInfoCard({ 
  leases, 
  agencyId, 
  propertyId,
  handleViewPayments
}: PropertyLeaseInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations du bail</CardTitle>
      </CardHeader>
      <CardContent>
        {leases.filter((lease: any) => lease.status === 'active').map((lease: any, index: number) => (
          <div key={`lease-summary-${index}`} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Début du bail</span>
                <span className="font-medium">{new Date(lease.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fin du bail</span>
                <span className="font-medium">{new Date(lease.end_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Loyer mensuel</span>
                <span className="font-medium">{formatCurrency(lease.monthly_rent, "FCFA")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Statut</span>
                <Badge variant={lease.status === 'active' ? 'success' : 'default'}>
                  {lease.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <Link to={`/agencies/${agencyId}/properties/${propertyId}/lease/${lease.id}`}>
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Détails du bail
              </Button>
            </Link>
            
            <Button 
              variant="default" 
              onClick={() => handleViewPayments(lease.id)}
              className="w-full"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Gérer les paiements
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
