
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import TenantForm from "@/components/tenants/TenantForm";
import { createTenant } from "@/services/tenantService";
import { Tenant } from "@/assets/types";
import { supabase } from "@/lib/supabase";
import { User, Phone, Briefcase } from "lucide-react";

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

export default function ManageTenantsPage() {
  const { agencyId, propertyId } = useParams();
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [newTenant, setNewTenant] = useState<TenantData>({});
  const [loading, setLoading] = useState(false);

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
        emergency_contact: newTenant.emergencyContact ? JSON.stringify(newTenant.emergencyContact) : null
      };

      // Call the createTenant API
      const { tenant, error } = await createTenant(tenantData);
      
      if (error) throw new Error(error);
      
      // Add the new tenant to the local state
      setTenants([...tenants, newTenant]);
      setNewTenant({});
      setIsAddingTenant(false);
      toast.success("Locataire ajouté avec succès");
    } catch (error: any) {
      toast.error(`Erreur lors de l'ajout du locataire: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Gérer les locataires</h1>
      <p className="text-gray-600 mb-6">
        Agence ID: {agencyId} | Propriété ID: {propertyId}
      </p>

      {/* List of existing tenants */}
      {tenants.length > 0 ? (
        <div className="grid gap-4 mb-6">
          {tenants.map((tenant, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
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
                      <h3 className="font-semibold">
                        {tenant.firstName} {tenant.lastName}
                      </h3>
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
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Aucun locataire n'a encore été ajouté à cette propriété.</p>
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
      ) : (
        <Button onClick={() => setIsAddingTenant(true)}>
          Ajouter un locataire
        </Button>
      )}
    </div>
  );
}
