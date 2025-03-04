
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Briefcase, Check, FileText, Home } from "lucide-react";
import LeaseDetailsDialog from '../leases/LeaseDetailsDialog';

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
  propertyId?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  lease?: {
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
  };
}

interface TenantListProps {
  tenants: TenantWithLease[];
  loading: boolean;
  searchQuery: string;
  agencyId?: string;
  propertyId?: string;
  handleCreateLease: (tenantId: string, propertyId?: string) => void;
  handleAssignTenant: (tenantId: string, propertyId?: string) => void;
  handleViewLeaseDetails?: (leaseId: string) => void;
}

const TenantList: React.FC<TenantListProps> = ({
  tenants,
  loading,
  searchQuery,
  agencyId,
  propertyId,
  handleCreateLease,
  handleAssignTenant,
  handleViewLeaseDetails
}) => {
  const navigate = useNavigate();
  const [selectedLease, setSelectedLease] = useState<any>(null);
  const [isLeaseDialogOpen, setIsLeaseDialogOpen] = useState(false);
  
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
              propertyId ? 
                "Aucun locataire n'a encore été ajouté à cette propriété." :
                "Aucun locataire n'a encore été ajouté à cette agence."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleViewProperty = (propertyId: string) => {
    if (!agencyId) return;
    navigate(`/agencies/${agencyId}/properties/${propertyId}`);
  };
  
  const handleViewLeaseInDialog = (tenant: TenantWithLease) => {
    if (!tenant.lease && tenant.leaseId) {
      // If we have leaseId but no lease object, create a minimal lease object
      const minimalLease = {
        id: tenant.leaseId,
        tenant_id: tenant.id || '',
        property_id: tenant.propertyId || '',
        start_date: '',
        end_date: '',
        monthly_rent: 0,
        security_deposit: 0,
        status: tenant.leaseStatus || 'active',
        tenant: {
          first_name: tenant.firstName || '',
          last_name: tenant.lastName || ''
        },
        property: {
          title: "Propriété"
        }
      };
      setSelectedLease(minimalLease);
    } else {
      setSelectedLease(tenant.lease);
    }
    setIsLeaseDialogOpen(true);
  };

  const onViewPayments = (leaseId: string) => {
    if (handleViewLeaseDetails) {
      handleViewLeaseDetails(leaseId);
    }
    setIsLeaseDialogOpen(false);
  };

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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewLeaseInDialog(tenant)}
                  >
                    <FileText className="h-4 w-4 mr-2" /> Voir le bail
                  </Button>
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
      ))}

      {/* Dialog pour afficher les détails du bail */}
      <LeaseDetailsDialog
        lease={selectedLease}
        isOpen={isLeaseDialogOpen}
        onClose={() => setIsLeaseDialogOpen(false)}
        onViewPayments={onViewPayments}
      />
    </div>
  );
};

export default TenantList;
