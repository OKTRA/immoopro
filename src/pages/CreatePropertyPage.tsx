
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, FileText, Users, ArrowRight, ArrowLeft, Check } from "lucide-react";
import PropertyBasicInfoForm from "@/components/properties/PropertyBasicInfoForm";
import PropertyFinancialInfoForm from "@/components/properties/PropertyFinancialInfoForm";
import PropertyMediaForm from "@/components/properties/PropertyMediaForm";
import PropertyOwnershipForm from "@/components/properties/PropertyOwnershipForm";
import { Property } from "@/assets/types";
import { createProperty } from "@/services/propertyService";

export default function CreatePropertyPage() {
  const navigate = useNavigate();
  const { agencyId } = useParams();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState("basic-info");
  const [propertyData, setPropertyData] = useState<Partial<Property>>({
    agencyId,
    status: "available",
    features: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: "basic-info", label: "Informations de base", icon: Home },
    { id: "financial-info", label: "Informations financières", icon: FileText },
    { id: "media", label: "Photos et médias", icon: FileText },
    { id: "ownership", label: "Propriétaire", icon: Users }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const updatePropertyData = (data: Partial<Property>) => {
    setPropertyData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { property, error } = await createProperty(propertyData as Omit<Property, 'id'>);
      
      if (error) {
        throw new Error(error);
      }
      
      toast({
        title: "Propriété créée avec succès",
        description: "Vous allez être redirigé vers la page de configuration du bail.",
      });
      
      setTimeout(() => {
        navigate(`/agencies/${agencyId}/properties/${property.id}/lease`);
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Erreur lors de la création",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Créer une nouvelle propriété</CardTitle>
          <CardDescription>
            Complétez les informations suivantes pour ajouter une propriété à votre portefeuille.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Tabs value={currentStep} className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                {steps.map((step, index) => (
                  <TabsTrigger 
                    key={step.id} 
                    value={step.id}
                    disabled={index > currentStepIndex}
                    onClick={() => index <= currentStepIndex && setCurrentStep(step.id)}
                    className={`flex flex-col items-center justify-center py-4 ${index <= currentStepIndex ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  >
                    <step.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs sm:text-sm">{step.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="basic-info" className="space-y-4 mt-4">
                <PropertyBasicInfoForm 
                  initialData={propertyData}
                  onUpdate={updatePropertyData}
                />
              </TabsContent>
              <TabsContent value="financial-info" className="space-y-4 mt-4">
                <PropertyFinancialInfoForm
                  initialData={propertyData}
                  onUpdate={updatePropertyData}
                />
              </TabsContent>
              <TabsContent value="media" className="space-y-4 mt-4">
                <PropertyMediaForm
                  initialData={propertyData}
                  onUpdate={updatePropertyData}
                />
              </TabsContent>
              <TabsContent value="ownership" className="space-y-4 mt-4">
                <PropertyOwnershipForm
                  initialData={propertyData}
                  onUpdate={updatePropertyData}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={isFirstStep || isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Précédent
          </Button>
          <Button 
            onClick={handleNext}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isLastStep ? (
              <>
                <Check className="h-4 w-4" /> Créer la propriété
              </>
            ) : (
              <>
                Suivant <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
