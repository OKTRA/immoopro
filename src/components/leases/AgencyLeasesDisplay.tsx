
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  PlusCircle, 
  Receipt, 
  Home, 
  User, 
  Calendar,
  Search,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getLeasesByAgencyId } from "@/services/tenant/leaseService";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface AgencyLeasesDisplayProps {
  agencyId: string;
}

export default function AgencyLeasesDisplay({ agencyId }: AgencyLeasesDisplayProps) {
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeases = async () => {
      if (!agencyId) return;
      
      try {
        setLoading(true);
        const { leases: agencyLeases, error } = await getLeasesByAgencyId(agencyId);
        
        if (error) {
          toast({
            title: "Erreur",
            description: `Impossible de récupérer les baux: ${error}`,
            variant: "destructive"
          });
          return;
        }
        
        setLeases(agencyLeases || []);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des baux:", err);
        toast({
          title: "Erreur",
          description: `Une erreur est survenue: ${err.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeases();
  }, [agencyId, toast]);

  const filteredLeases = leases.filter(lease => {
    const searchTerms = searchQuery.toLowerCase();
    const propertyTitle = lease.properties?.title?.toLowerCase() || '';
    const propertyLocation = lease.properties?.location?.toLowerCase() || '';
    const tenantName = `${lease.tenants?.first_name || ''} ${lease.tenants?.last_name || ''}`.toLowerCase();
    
    return propertyTitle.includes(searchTerms) || 
           propertyLocation.includes(searchTerms) || 
           tenantName.includes(searchTerms);
  });

  const handleViewProperty = (propertyId: string) => {
    navigate(`/agencies/${agencyId}/properties/${propertyId}`);
  };

  const handleViewTenant = (tenantId: string) => {
    navigate(`/agencies/${agencyId}/tenants/${tenantId}`);
  };

  const handleViewLeaseDetails = (leaseId: string) => {
    navigate(`/agencies/${agencyId}/leases/${leaseId}`);
  };

  const handleViewLeasePayments = (leaseId: string, propertyId: string) => {
    navigate(`/agencies/${agencyId}/properties/${propertyId}/leases/${leaseId}/payments`);
  };

  const handleCreateLease = () => {
    navigate(`/agencies/${agencyId}/lease/create`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Gestion des Baux</CardTitle>
            <CardDescription>
              Liste des baux actifs dans votre agence
            </CardDescription>
          </div>
          <Button onClick={handleCreateLease}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Créer un nouveau bail
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par propriété ou locataire..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredLeases.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun bail trouvé</h3>
            {searchQuery ? (
              <p className="text-muted-foreground max-w-md mx-auto">
                Aucun résultat ne correspond à votre recherche. Essayez avec d'autres termes.
              </p>
            ) : (
              <p className="text-muted-foreground max-w-md mx-auto">
                Créez votre premier bail pour commencer à gérer vos locataires et vos propriétés.
              </p>
            )}
            {!searchQuery && (
              <Button onClick={handleCreateLease} className="mt-4">
                <PlusCircle className="h-4 w-4 mr-2" />
                Créer un bail
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Propriété</TableHead>
                  <TableHead>Locataire</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Loyer</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeases.map((lease) => (
                  <TableRow key={lease.id} className="group hover:bg-muted/50">
                    <TableCell>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-left"
                        onClick={() => handleViewProperty(lease.property_id)}
                      >
                        <Home className="h-4 w-4 mr-1 inline" />
                        {lease.properties?.title}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-left"
                        onClick={() => handleViewTenant(lease.tenant_id)}
                      >
                        <User className="h-4 w-4 mr-1 inline" />
                        {lease.tenants?.first_name} {lease.tenants?.last_name}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        {new Date(lease.start_date).toLocaleDateString()} au {new Date(lease.end_date).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(lease.monthly_rent, 'FCFA')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={lease.status === 'active' ? 'success' : 'default'}>
                        {lease.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewLeasePayments(lease.id, lease.property_id)}
                        >
                          <Receipt className="h-4 w-4 mr-1" />
                          Paiements
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleViewLeaseDetails(lease.id)}
                        >
                          Détails
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
