
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TenantForm from "@/components/tenants/TenantForm";
import { Tenant } from "@/assets/types";

// Interface that extends Partial<Tenant> with the specific fields we need
interface TenantData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  employmentStatus?: string;
}

export default function ManageTenantsPage() {
  const { agencyId, propertyId } = useParams();
  const [tenants, setTenants] = useState<TenantData[]>([]);
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [newTenant, setNewTenant] = useState<TenantData>({});

  // Function to handle tenant data updates
  const handleTenantUpdate = (data: TenantData) => {
    setNewTenant(data);
  };

  // Function to add a new tenant
  const handleAddTenant = () => {
    // Check if we have the minimum required data
    if (newTenant.firstName && newTenant.lastName && newTenant.email) {
      setTenants([...tenants, newTenant]);
      setNewTenant({});
      setIsAddingTenant(false);
    } else {
      // Here you could show an error message using the toast component
      console.error("Please fill in all required fields");
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
                  <div>
                    <h3 className="font-semibold">
                      {tenant.firstName} {tenant.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{tenant.email}</p>
                    <p className="text-sm text-gray-600">{tenant.phone}</p>
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
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddingTenant(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleAddTenant}>
                Ajouter le locataire
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
