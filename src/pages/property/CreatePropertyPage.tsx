import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import CreatePropertyForm from "./CreatePropertyForm";
import usePropertyData from "./usePropertyData";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function CreatePropertyPage() {
  const { agencyId, propertyId } = useParams();
  const navigate = useNavigate();
  const { formData, setFormData, isLoading, isEditMode } =
    usePropertyData(propertyId);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (isEditMode && propertyId) {
      // Fetch property data for editing
      const fetchPropertyData = async () => {
        setFetchingData(true);
        try {
          console.log("Fetching property data for ID:", propertyId);
          const { data, error } = await supabase
            .from("properties")
            .select("*")
            .eq("id", propertyId)
            .single();

          if (error) {
            console.error("Supabase error:", error);
            throw error;
          }

          if (data) {
            console.log("Property data retrieved:", data);
            // Set form data with the loaded property data
            setFormData({
              title: data.title || "",
              description: data.description || "",
              type: data.type || "apartment",
              status: data.status || "available",
              price: data.price || 0,
              location: data.location || "",
              bedrooms: data.bedrooms || 0,
              bathrooms: data.bathrooms || 0,
              area: data.area || 0,
              yearBuilt: data.year_built || new Date().getFullYear(),
              features: data.features || [],
              ownerName: data.owner_name || "",
              ownerContact: data.owner_contact || "",
              ownerEmail: data.owner_email || "",
              maintenanceFee: data.maintenance_fee || 0,
              propertyTax: data.property_tax || 0,
              insuranceCost: data.insurance_cost || 0,
              rentalYield: data.rental_yield || 0,
              images: data.images || [],
            });
            console.log("Property data loaded into form:", data);
          } else {
            console.warn("No property data found for ID:", propertyId);
            toast.warning(
              "Property not found. Creating a new property instead.",
            );
          }
        } catch (error: any) {
          console.error("Error fetching property:", error);
          toast.error(`Error loading property: ${error.message}`);
        } finally {
          setFetchingData(false);
        }
      };

      fetchPropertyData();
    }
  }, [isEditMode, propertyId, setFormData]);

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
          <CardTitle>
            {isEditMode
              ? "Modifier une propriété"
              : "Créer une nouvelle propriété"}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? "Mettez à jour les informations de cette propriété"
              : "Ajouter une nouvelle propriété à votre portefeuille immobilier"}
          </CardDescription>
        </CardHeader>
      </Card>

      {isEditMode && (isLoading || fetchingData) ? (
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
