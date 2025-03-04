
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Receipt, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PropertyLeasesTabProps {
  isLoadingLeases: boolean;
  hasActiveLeases: boolean;
  leases: any[];
  agencyId: string | undefined;
  propertyId: string | undefined;
  handleViewPayments: (leaseId: string) => void;
}

export default function PropertyLeasesTab({ 
  isLoadingLeases, 
  hasActiveLeases, 
  leases, 
  agencyId, 
  propertyId,
  handleViewPayments 
}: PropertyLeasesTabProps) {
  return (
    <>
      {isLoadingLeases ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : hasActiveLeases ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-2">Baux existants</h3>
          {leases.map((lease: any) => (
            <Card key={lease.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-md">
                  Bail {new Date(lease.start_date).toLocaleDateString()} - {new Date(lease.end_date).toLocaleDateString()}
                </CardTitle>
                <Badge variant={lease.status === 'active' ? 'success' : 'default'}>
                  {lease.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Locataire</p>
                      <p className="font-medium">
                        {lease.tenants?.first_name} {lease.tenants?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-medium">{lease.tenants?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Loyer mensuel</p>
                      <p className="font-medium">{formatCurrency(lease.monthly_rent, "FCFA")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dépôt de garantie</p>
                      <p className="font-medium">{formatCurrency(lease.security_deposit, "FCFA")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 py-2 flex justify-between">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleViewPayments(lease.id)}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Paiements
                </Button>
                <Button size="sm" variant="default" asChild>
                  <Link to={`/agencies/${agencyId}/properties/${propertyId}/lease/${lease.id}`}>
                    Gérer ce bail
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Gestion des baux</h3>
          <p className="text-muted-foreground mb-4">
            Créez et gérez les baux pour cette propriété
          </p>
          <Link to={`/agencies/${agencyId}/properties/${propertyId}/lease/create`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer un bail
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}
