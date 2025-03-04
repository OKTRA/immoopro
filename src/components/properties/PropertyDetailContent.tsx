
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";

import PropertyDetailsTab from './tabs/PropertyDetailsTab';
import PropertyFinancialTab from './tabs/PropertyFinancialTab';
import PropertyLeasesTab from './tabs/PropertyLeasesTab';
import PropertyTenantsTab from './tabs/PropertyTenantsTab';

interface PropertyDetailContentProps {
  property: any;
  agencyId: string | undefined;
  propertyId: string | undefined;
  isLoadingLeases: boolean;
  hasActiveLeases: boolean;
  leases: any[];
  handleViewPayments: (leaseId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function PropertyDetailContent({
  property,
  agencyId,
  propertyId,
  isLoadingLeases,
  hasActiveLeases,
  leases,
  handleViewPayments,
  activeTab,
  setActiveTab
}: PropertyDetailContentProps) {
  const activeLeaseId = hasActiveLeases && leases.filter((lease: any) => lease.status === 'active')[0]?.id;

  return (
    <div className="lg:col-span-2">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Détails de la propriété</CardTitle>
              <CardDescription>Informations sur cette propriété</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {hasActiveLeases && activeLeaseId && (
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleViewPayments(activeLeaseId)}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Gestion des paiements
                </Button>
              )}
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(property.price, "FCFA")}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="financial">Financier</TabsTrigger>
              <TabsTrigger value="leases">Baux</TabsTrigger>
              <TabsTrigger value="tenants">Locataires</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <PropertyDetailsTab property={property} />
            </TabsContent>

            <TabsContent value="financial">
              <PropertyFinancialTab 
                property={property} 
                agencyId={agencyId} 
                propertyId={propertyId} 
                hasActiveLeases={hasActiveLeases} 
                leases={leases}
                handleViewPayments={handleViewPayments}
              />
            </TabsContent>

            <TabsContent value="leases">
              <PropertyLeasesTab 
                isLoadingLeases={isLoadingLeases}
                hasActiveLeases={hasActiveLeases}
                leases={leases}
                agencyId={agencyId}
                propertyId={propertyId}
                handleViewPayments={handleViewPayments}
              />
            </TabsContent>

            <TabsContent value="tenants">
              <PropertyTenantsTab 
                isLoadingLeases={isLoadingLeases}
                hasActiveLeases={hasActiveLeases}
                leases={leases}
                agencyId={agencyId}
                propertyId={propertyId}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
