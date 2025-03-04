
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface PropertyTenantsTabProps {
  isLoadingLeases: boolean;
  hasActiveLeases: boolean;
  leases: any[];
  agencyId: string | undefined;
  propertyId: string | undefined;
}

export default function PropertyTenantsTab({ 
  isLoadingLeases, 
  hasActiveLeases, 
  leases, 
  agencyId, 
  propertyId 
}: PropertyTenantsTabProps) {
  return (
    <>
      {isLoadingLeases ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : hasActiveLeases ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium mb-2">Locataires actuels</h3>
          {leases.map((lease: any) => (
            lease.tenants && (
              <Card key={`tenant-${lease.tenant_id}`} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    {lease.tenants.first_name} {lease.tenants.last_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{lease.tenants.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Téléphone</p>
                        <p className="font-medium">{lease.tenants.phone || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 py-2">
                  <Button size="sm" variant="outline" className="ml-auto" asChild>
                    <Link to={`/agencies/${agencyId}/tenants/${lease.tenant_id}`}>
                      Voir le profil
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Gestion des locataires</h3>
          <p className="text-muted-foreground mb-4">
            Gérez les locataires associés à cette propriété
          </p>
          <Link to={`/agencies/${agencyId}/properties/${propertyId}/tenants`}>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Gérer les locataires
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}
