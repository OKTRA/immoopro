
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";
import PropertyBasicInfoForm from "@/components/properties/PropertyBasicInfoForm";
import PropertyFinancialInfoForm from "@/components/properties/PropertyFinancialInfoForm";
import PropertyMediaForm from "@/components/properties/PropertyMediaForm";
import PropertyOwnershipForm from "@/components/properties/PropertyOwnershipForm";
import { createProperty, updateProperty } from "@/services/property";

interface CreatePropertyFormProps {
  formData: any;
  setFormData: (data: any) => void;
  propertyId?: string;
  agencyId?: string;
  onSuccess: () => void;
}

export default function CreatePropertyForm({ 
  formData, 
  setFormData, 
  propertyId, 
  agencyId,
  onSuccess
}: CreatePropertyFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!propertyId;

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

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
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting property:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid w-full grid-cols-4">
            <TabsTrigger value="basic">Informations de base</TabsTrigger>
            <TabsTrigger value="financial">Financier</TabsTrigger>
            <TabsTrigger value="media">Photos & Média</TabsTrigger>
            <TabsTrigger value="ownership">Propriétaire</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <PropertyBasicInfoForm 
              initialData={formData}
              onChange={updateFormData}
              onNext={() => setActiveTab("financial")}
            />
          </TabsContent>
          
          <TabsContent value="financial">
            <PropertyFinancialInfoForm 
              initialData={formData}
              onChange={updateFormData}
              onNext={() => setActiveTab("media")}
              onBack={() => setActiveTab("basic")}
            />
          </TabsContent>
          
          <TabsContent value="media">
            <PropertyMediaForm 
              initialData={formData}
              onChange={updateFormData}
              onNext={() => setActiveTab("ownership")}
              onBack={() => setActiveTab("financial")}
            />
          </TabsContent>
          
          <TabsContent value="ownership">
            <PropertyOwnershipForm 
              initialData={formData.ownerInfo}
              onChange={(ownerInfo) => updateFormData({ ownerInfo })}
              onBack={() => setActiveTab("media")}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onSuccess}
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
  );
}
