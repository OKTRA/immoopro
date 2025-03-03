
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TenantForm from "@/components/tenants/TenantForm";
import { toast } from "sonner";
import { createTenant } from "@/services/tenant/tenantService";
import { supabase } from "@/lib/supabase";

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

interface AddTenantFormProps {
  onCancel: () => void;
  onSuccess: (newTenant: any) => void;
}

const AddTenantForm: React.FC<AddTenantFormProps> = ({ onCancel, onSuccess }) => {
  const { agencyId } = useParams();
  const [newTenant, setNewTenant] = useState<TenantData>({});
  const [loading, setLoading] = useState(false);

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

    if (!agencyId) {
      toast.error("Impossible de créer un locataire sans ID d'agence");
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
        emergency_contact: newTenant.emergencyContact,
        agency_id: agencyId // Associer le locataire à l'agence actuelle
      };

      const { tenant, error } = await createTenant(tenantData, agencyId);
      
      if (error) throw new Error(error);
      
      const newTenantWithId = {
        ...newTenant,
        id: tenant?.id,
        hasLease: false,
        agencyId: agencyId
      };
      
      onSuccess(newTenantWithId);
      toast.success("Locataire ajouté avec succès");
    } catch (error: any) {
      toast.error(`Erreur lors de l'ajout du locataire: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
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
            onClick={onCancel}
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
  );
};

export default AddTenantForm;
