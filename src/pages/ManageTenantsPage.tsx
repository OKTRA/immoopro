
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import TenantForm from "@/components/tenants/TenantForm";
import { createTenant, getTenantsByPropertyId } from "@/services/tenantService";
import { Tenant } from "@/assets/types";
import { supabase } from "@/lib/supabase";
import { User, Phone, Briefcase, Check, FileText, Home, UserPlus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Interface that extends Partial<Tenant> with the specific fields we need
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

// Extended tenant data with lease information
interface TenantWithLease extends TenantData {
  id?: string;
  hasLease?: boolean;
  leaseId?: string;
  leaseStatus?: string;
}

export default function ManageTenantsPage() {
  const { agencyId, propertyId } = useParams();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantWithLease[]>([]);
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [newTenant, setNewTenant] = useState<TenantData>({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchingTenants, setFetchingTenants] = useState(true);
  const [filterAssigned, setFilterAssigned] = useState(false);

  // Fetch tenants data
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

  // Function to handle tenant data updates
  const handleTenantUpdate = (data: TenantData) => {
    setNewTenant(data);
  };

  // Function to handle the upload of the tenant photo
  const handleUploadPhoto = async (file: File): Promise<string> => {
    // Generate a unique file name for the tenant photo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `tenants/${fileName}`;

    try {
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('tenant-photos')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (error) throw error;

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('tenant-photos')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading tenant photo:', error);
      throw new Error(`Failed to upload photo: ${error.message}`);
    }
  };

  // Function to add a new tenant
  const handleAddTenant = async () => {
    // Check if we have the minimum required data
    if (!newTenant.firstName || !newTenant.lastName || !newTenant.email || !newTenant.phone) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      // Prepare the tenant data for the API
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

      // Call the createTenant API
      const { tenant, error } = await createTenant(tenantData);
      
      if (error) throw new Error(error);
      
      // Add the new tenant to the local state
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

  // Function to create a lease for a tenant
  const handleCreateLease = (tenantId: string) => {
    if (!propertyId || !agencyId) return;
    navigate(`/agencies/${agencyId}/properties/${propertyId}/lease/create?tenantId=${tenantId}`);
  };

  // Function to assign tenant to property directly
  const handleAssignTenant = (tenantId: string) => {
    if (!propertyId || !agencyId) return;
    navigate(`/agencies/${agencyId}/properties/${propertyId}/lease/create?tenantId=${tenantId}&quickAssign=true`);
  };

  // Filter tenants based on search query and assignment filter
  const filteredTenants = tenants
    .filter(tenant => {
      const fullName = `${tenant.firstName} ${tenant.lastName}`.toLowerCase();
      const email = tenant.email?.toLowerCase() || '';
      const phone = tenant.phone?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      
      return fullName.includes(query) || email.includes(query) || phone.includes(query);
    })
    .filter(tenant => !filterAssigned || tenant.hasLease);

  return (
    <div className="container mx-auto py-8">
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

      {/* Search and filter controls */}
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

      {/* List of existing tenants */}
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

      {/* Add new tenant form */}
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
    </div>
  );
}
