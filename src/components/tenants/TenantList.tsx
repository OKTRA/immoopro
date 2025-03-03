
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Briefcase, Check, FileText, Home } from "lucide-react";

interface TenantWithLease {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  employmentStatus?: string;
  profession?: string;
  photoUrl?: string;
  hasLease?: boolean;
  leaseId?: string;
  leaseStatus?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

interface TenantListProps {
  tenants: TenantWithLease[];
  loading: boolean;
  searchQuery: string;
  agencyId?: string;
  propertyId?: string;
  handleCreateLease: (tenantId: string) => void;
  handleAssignTenant: (tenantId: string) => void;
}

const TenantList: React.FC<TenantListProps> = ({
  tenants,
  loading,
  searchQuery,
  handleCreateLease,
  handleAssignTenant
}) => {
  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Chargement des locataires...</p>
        </CardContent>
      </Card>
    );
  }

  if (tenants.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">
            {searchQuery ? 
              "Aucun locataire ne correspond à votre recherche." : 
              "Aucun locataire n'a encore été ajouté à cette propriété."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 mb-6">
      {tenants.map((tenant, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                {tenant.photoUrl ? (
                  <img 
                    src={tenant.photoUrl} 
                    alt={`${tenant.firstName} ${tenant.lastName}`} 
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {tenant.firstName} {tenant.lastName}
                    </h3>
                    {tenant.hasLease && (
                      <Badge className="ml-2" variant="secondary">
                        <Check className="h-3 w-3 mr-1" /> Attribué
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Phone className="h-3 w-3 mr-1" /> {tenant.phone}
                  </div>
                  {tenant.profession && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="h-3 w-3 mr-1" /> {tenant.profession}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto justify-end">
                {tenant.hasLease ? (
                  <Button variant="outline" size="sm" onClick={() => handleCreateLease(tenant.id || '')}>
                    <FileText className="h-4 w-4 mr-2" /> Voir le bail
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleCreateLease(tenant.id || '')}>
                      <FileText className="h-4 w-4 mr-2" /> Créer un bail
                    </Button>
                    <Button variant="default" size="sm" onClick={() => handleAssignTenant(tenant.id || '')}>
                      <Home className="h-4 w-4 mr-2" /> Attribuer à la propriété
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TenantList;
