
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Briefcase, Check, FileText, Home, ExternalLink } from "lucide-react";
import { TenantWithLease } from './types';

interface TenantCardProps {
  tenant: TenantWithLease;
  agencyId?: string;
  propertyId?: string;
  handleCreateLease: (tenantId: string, propertyId?: string) => void;
  handleAssignTenant: (tenantId: string, propertyId?: string) => void;
  handleViewLeaseInDialog: (tenant: TenantWithLease) => void;
  handleViewProperty: (propertyId: string) => void;
}

const TenantCard: React.FC<TenantCardProps> = ({
  tenant,
  agencyId,
  propertyId,
  handleCreateLease,
  handleAssignTenant,
  handleViewLeaseInDialog,
  handleViewProperty
}) => {
  const navigate = useNavigate();
  
  const handleViewLeaseDetails = () => {
    if (tenant.leaseId && agencyId && tenant.propertyId) {
      navigate(`/agencies/${agencyId}/properties/${tenant.propertyId}/leases/${tenant.leaseId}`);
    } else {
      handleViewLeaseInDialog(tenant);
    }
  };

  return (
    <Card>
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
              {tenant.hasLease && tenant.propertyId && !propertyId && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Home className="h-3 w-3 mr-1" /> 
                  <Button 
                    variant="link" 
                    className="p-0 h-auto" 
                    onClick={() => handleViewProperty(tenant.propertyId!)}
                  >
                    Voir la propriété
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end">
            {tenant.hasLease && tenant.leaseId ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewLeaseInDialog(tenant)}
                >
                  <FileText className="h-4 w-4 mr-2" /> Aperçu du bail
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleViewLeaseDetails}
                >
                  <ExternalLink className="h-4 w-4 mr-2" /> Détails complets
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => handleCreateLease(tenant.id || '', propertyId)}>
                  <FileText className="h-4 w-4 mr-2" /> Créer un bail
                </Button>
                <Button variant="default" size="sm" onClick={() => handleAssignTenant(tenant.id || '', propertyId)}>
                  <Home className="h-4 w-4 mr-2" /> 
                  {propertyId ? "Attribuer à la propriété" : "Attribuer à une propriété"}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantCard;
