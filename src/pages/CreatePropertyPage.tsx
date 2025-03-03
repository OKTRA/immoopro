
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import PropertyBasicInfoForm from "@/components/properties/PropertyBasicInfoForm";
import PropertyFinancialInfoForm from "@/components/properties/PropertyFinancialInfoForm";
import PropertyMediaForm from "@/components/properties/PropertyMediaForm";
import PropertyOwnershipForm from "@/components/properties/PropertyOwnershipForm";
import { createProperty, getPropertyById, updateProperty } from "@/services/propertyService";
import { useQuery } from "@tanstack/react-query";

export default function CreatePropertyPage() {
  const { agencyId, propertyId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "apartment",
    location: "",
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    price: 0,
    status: "available",
    features: [],
    petsAllowed: false,
    furnished: false,
    paymentFrequency: "monthly",
    securityDeposit: 0,
    yearBuilt: "",
    agencyFees: 0,
    imageUrl: "",
    virtualTourUrl: "",
    ownerInfo: {
      ownerId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: ""
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!propertyId;
  
  // Fetch property data in edit mode
  const { data: propertyData, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getPropertyById(propertyId || ''),
    enabled: isEditMode,
    onSuccess: (data) => {
      if (data?.property) {
        setFormData(prevData => ({
          ...prevData,
          ...data.property,
          ownerInfo: data.property.owner || prevData.ownerInfo
        }));
      }
    },
    onError: (error) => {
      toast.error("Impossible de charger les données de la propriété");
      console.error("Error fetching property:", error);
    }
  });

  const handleSubmit = async () => {
    if (!agencyId) {
      toast.error("ID d'agence manquant");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare data for submission
      const dataToSubmit = {
        ...formData,
        agencyId
      };
      
      console.log("Submitting property data:", dataToSubmit);
      
      let result;
      
      if (isEditMode) {
        result = await updateProperty(propertyId || '', dataToSubmit);
        if (result.error) throw new Error(result.error);
        toast.success("Propriété mise à jour avec succès");
      } else {
        result = await createProperty(dataToSubmit);
        if (result.error) throw new Error(result.error);
        toast.success("Propriété créée avec succès");
      }
      
      // Navigate back to agency
      navigate(`/agencies/${agencyId}`);
    } catch (error: any) {
      console.error("Error submitting property:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => navigate(`/agencies/${agencyId}`)}
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
        <CardContent>
          {isLoading && isEditMode ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 grid w-full grid-cols-4">
                <TabsTrigger value="basic">Informations de base</TabsTrigger>
                <TabsTrigger value="financial">Financier</TabsTrigger>
                <TabsTrigger value="media">Photos & Média</TabsTrigger>
                <TabsTrigger value="ownership">Propriétaire</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic">
                <PropertyBasicInfoForm 
                  data={formData}
                  onChange={updateFormData}
                  onNext={() => setActiveTab("financial")}
                />
              </TabsContent>
              
              <TabsContent value="financial">
                <PropertyFinancialInfoForm 
                  data={formData}
                  onChange={updateFormData}
                  onNext={() => setActiveTab("media")}
                  onBack={() => setActiveTab("basic")}
                />
              </TabsContent>
              
              <TabsContent value="media">
                <PropertyMediaForm 
                  data={formData}
                  onChange={updateFormData}
                  onNext={() => setActiveTab("ownership")}
                  onBack={() => setActiveTab("financial")}
                />
              </TabsContent>
              
              <TabsContent value="ownership">
                <PropertyOwnershipForm 
                  data={formData.ownerInfo}
                  onChange={(ownerInfo) => updateFormData({ ownerInfo })}
                  onBack={() => setActiveTab("media")}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/agencies/${agencyId}`)}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditMode ? "Mettre à jour" : "Créer"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
