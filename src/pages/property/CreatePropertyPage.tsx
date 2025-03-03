
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import CreatePropertyForm from "./CreatePropertyForm";
import usePropertyData from "./usePropertyData";

export default function CreatePropertyPage() {
  const { agencyId, propertyId } = useParams();
  const navigate = useNavigate();
  const { formData, setFormData, isLoading, isEditMode } = usePropertyData(propertyId);

  const handleNavigateBack = () => {
    navigate(`/agencies/${agencyId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleNavigateBack}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à l'agence
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{isEditMode ? "Modifier une propriété" : "Créer une nouvelle propriété"}</CardTitle>
          <CardDescription>
            {isEditMode 
              ? "Mettez à jour les informations de cette propriété" 
              : "Ajouter une nouvelle propriété à votre portefeuille immobilier"}
          </CardDescription>
        </CardHeader>
      </Card>
      
      {isEditMode && isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <CreatePropertyForm 
          formData={formData}
          setFormData={setFormData}
          propertyId={propertyId}
          agencyId={agencyId}
          onSuccess={handleNavigateBack}
        />
      )}
    </div>
  );
}
