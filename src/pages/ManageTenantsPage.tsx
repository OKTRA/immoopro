
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import TenantForm from "@/components/tenants/TenantForm";
import { createTenant, getTenantsByPropertyId } from "@/services/tenantService";
import { Tenant } from "@/assets/types";
import { supabase } from "@/lib/supabase";
import { User, Phone, Briefcase, Check, FileText, Home, UserPlus, Search, Calendar, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface TenantData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  employmentStatus?: string;
  profession?: string;
  photoUrl?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

interface TenantWithLease extends TenantData {
  id?: string;
  hasLease?: boolean;
  leaseId?: string;
  leaseStatus?: string;
}

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
}

export default function ManageTenantsPage({ leaseView = false }) {
  const { agencyId, propertyId } = useParams();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantWithLease[]>([]);
  const [leases, setLeases] = useState<LeaseData[]>([]);
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [newTenant, setNewTenant] = useState<TenantData>({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchingTenants, setFetchingTenants] = useState(true);
  const [fetchingLeases, setFetchingLeases] = useState(false);
  const [filterAssigned, setFilterAssigned] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    
    const fetchTenants = async () => {
      setFetchingTenants(true);
      try {
        const { tenants, error } = await getTenantsByPropertyId(propertyId);
        
        if (error) throw new Error(error);
        
        setTenants(tenants || []);
      } catch (error: any) {
        toast.error(`Erreur lors du chargement des locataires: ${error.message}`);
      } finally {
        setFetchingTenants(false);
      }
    };
    
    fetchTenants();
  }, [propertyId]);

  useEffect(() => {
    if (leaseView) {
      fetchLeases();
    }
  }, [leaseView, propertyId, agencyId]);

  const fetchLeases = async () => {
    setFetchingLeases(true);
    try {
      let query = supabase
        .from('leases')
        .select(`
          id,
          tenant_id,
          property_id,
          start_date,
          end_date,
          monthly_rent,
          security_deposit,
          status,
          tenants:tenant_id (
            first_name,
            last_name
          ),
          properties:property_id (
            title
          )
        `);

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      } else if (agencyId) {
        // If only agency ID is provided, need to join with properties to filter by agency
        const { data: agencyProperties } = await supabase
          .from('properties')
          .select('id')
          .eq('agency_id', agencyId);
          
        if (agencyProperties && agencyProperties.length > 0) {
          const propertyIds = agencyProperties.map(prop => prop.id);
          query = query.in('property_id', propertyIds);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      
      console.log("Fetched leases:", data);
      setLeases(data || []);
    } catch (error: any) {
      console.error("Error fetching leases:", error);
      toast.error(`Erreur lors du chargement des baux: ${error.message}`);
    } finally {
      setFetchingLeases(false);
    }
  };

  const handleTenantUpdate = (data: TenantData) => {
    setNewTenant(data);
  };

  const handleUploadPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `tenants/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from('tenant-photos')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('tenant-photos')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading tenant photo:', error);
      throw new Error(`Failed to upload photo: ${error.message}`);
    }
  };

  const handleAddTenant = async () => {
    if (!newTenant.firstName || !newTenant.lastName || !newTenant.email || !newTenant.phone) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const tenantData = {
        first_name: newTenant.firstName,
        last_name: newTenant.lastName,
        email: newTenant.email,
        phone: newTenant.phone,
        employment_status: newTenant.employmentStatus,
        profession: newTenant.profession,
        photo_url: newTenant.photoUrl,
        emergency_contact: newTenant.emergencyContact
      };

      const { tenant, error } = await createTenant(tenantData);
      
      if (error) throw new Error(error);
      
      const newTenantWithId: TenantWithLease = {
        ...newTenant,
        id: tenant?.id,
        hasLease: false
      };
      setTenants([...tenants, newTenantWithId]);
      setNewTenant({});
      setIsAddingTenant(false);
      toast.success("Locataire ajouté avec succès");
    } catch (error: any) {
      toast.error(`Erreur lors de l'ajout du locataire: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLease = (tenantId: string) => {
    if (!propertyId || !agencyId) return;
    navigate(`/agencies/${agencyId}/properties/${propertyId}/lease/create?tenantId=${tenantId}`);
  };

  const handleAssignTenant = (tenantId: string) => {
    if (!propertyId || !agencyId) return;
    navigate(`/agencies/${agencyId}/properties/${propertyId}/lease/create?tenantId=${tenantId}&quickAssign=true`);
  };

  const handleViewLeaseDetails = (leaseId: string) => {
    if (!agencyId) return;
    navigate(`/agencies/${agencyId}/properties/${propertyId}/leases/${leaseId}/payments`);
  };

  const filteredTenants = tenants
    .filter(tenant => {
      const fullName = `${tenant.firstName} ${tenant.lastName}`.toLowerCase();
      const email = tenant.email?.toLowerCase() || '';
      const phone = tenant.phone?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      
      return fullName.includes(query) || email.includes(query) || phone.includes(query);
    })
    .filter(tenant => !filterAssigned || tenant.hasLease);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        {leaseView ? "Gestion des Baux" : "Gestion des Locataires"}
      </h1>
      
      {leaseView ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Liste des Baux</h2>
            <Button onClick={() => navigate(`/agencies/${agencyId}/properties/${propertyId}/lease/create`)}>
              Créer un nouveau bail
            </Button>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propriété
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locataire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de début
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loyer mensuel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fetchingLeases ? (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={7}>
                      Chargement des baux...
                    </td>
                  </tr>
                ) : leases.length > 0 ? (
                  leases.map((lease) => (
                    <tr key={lease.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lease.property?.title || "Propriété non spécifiée"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lease.tenant ? `${lease.tenant.first_name} ${lease.tenant.last_name}` : "Non assigné"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lease.start_date ? format(new Date(lease.start_date), 'dd/MM/yyyy') : "Non défini"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lease.end_date ? format(new Date(lease.end_date), 'dd/MM/yyyy') : "Non défini"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(lease.monthly_rent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={
                          lease.status === 'active' ? 'bg-green-100 text-green-800' : 
                          lease.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }>
                          {lease.status === 'active' ? 'Actif' : 
                           lease.status === 'pending' ? 'En attente' : 
                           lease.status === 'expired' ? 'Expiré' : lease.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewLeaseDetails(lease.id)}>
                            <CreditCard className="h-4 w-4 mr-2" /> Paiements
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={7}>
                      Aucun bail n'a été trouvé. Créez votre premier bail!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Gérer les locataires</h1>
              <p className="text-gray-600 mb-4">
                Agence ID: {agencyId} | Propriété ID: {propertyId}
              </p>
            </div>
            <Button onClick={() => setIsAddingTenant(true)} className="mt-2 md:mt-0">
              <UserPlus className="mr-2 h-4 w-4" /> Ajouter un locataire
            </Button>
          </div>

          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un locataire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant={filterAssigned ? "default" : "outline"} 
              onClick={() => setFilterAssigned(!filterAssigned)}
              className="md:w-auto w-full"
            >
              <Check className={`mr-2 h-4 w-4 ${!filterAssigned && "opacity-50"}`} />
              Locataires attribués uniquement
            </Button>
          </div>

          {fetchingTenants ? (
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">Chargement des locataires...</p>
              </CardContent>
            </Card>
          ) : filteredTenants.length > 0 ? (
            <div className="grid gap-4 mb-6">
              {filteredTenants.map((tenant, index) => (
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
          ) : (
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">
                  {searchQuery ? 
                    "Aucun locataire ne correspond à votre recherche." : 
                    "Aucun locataire n'a encore été ajouté à cette propriété."}
                </p>
              </CardContent>
            </Card>
          )}

          {isAddingTenant ? (
            <Card>
              <CardHeader>
                <CardTitle>Ajouter un nouveau locataire</CardTitle>
              </CardHeader>
              <CardContent>
                <TenantForm 
                  initialData={newTenant} 
                  onUpdate={handleTenantUpdate} 
                  onFileUpload={handleUploadPhoto}
                />
                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingTenant(false)}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleAddTenant}
                    disabled={loading}
                  >
                    {loading ? "Création en cours..." : "Ajouter le locataire"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredTenants.length === 0 && !searchQuery && (
            <Button onClick={() => setIsAddingTenant(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Ajouter un locataire
            </Button>
          )}
        </>
      )}
    </div>
  );
}
