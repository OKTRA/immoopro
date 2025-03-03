
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getPropertyById } from "@/services/property";

export default function usePropertyData(propertyId: string | undefined) {
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

  // Is this edit mode?
  const isEditMode = !!propertyId;
  
  // Fetch property data in edit mode
  const { data: propertyData, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => getPropertyById(propertyId || ''),
    enabled: isEditMode,
    meta: {
      onSettled: (data, error) => {
        if (data?.property) {
          console.log("Property data loaded:", data.property);
          // Preserve original property data structure for editing
          setFormData(prevData => ({
            ...prevData,
            ...data.property,
            // Ensure ownerInfo is properly structured
            ownerInfo: data.property.ownerInfo || {
              ownerId: data.property.ownerId || "",
              firstName: "",
              lastName: "",
              email: "",
              phone: ""
            }
          }));
        }
        if (error) {
          toast.error("Impossible de charger les données de la propriété");
          console.error("Error fetching property:", error);
        }
      }
    }
  });

  return {
    formData,
    setFormData,
    isLoading,
    isEditMode
  };
}
