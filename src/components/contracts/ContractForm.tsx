import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Save,
  FileText,
  FileEdit,
  AlertCircle,
  RefreshCw,
  Bug,
  Info,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Define schemas for different contract creation modes
const baseContractSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Le titre doit contenir au moins 3 caractères" }),
  type: z.string(),
});

const fromScratchSchema = baseContractSchema.extend({
  tenant: z.string().min(1, { message: "Veuillez sélectionner un locataire" }),
  property: z
    .string()
    .min(1, { message: "Veuillez sélectionner une propriété" }),
  startDate: z
    .string()
    .min(1, { message: "Veuillez sélectionner une date de début" }),
  endDate: z
    .string()
    .min(1, { message: "Veuillez sélectionner une date de fin" }),
  additionalTerms: z.string().optional(),
});

const fromLeaseSchema = baseContractSchema.extend({
  leaseId: z.string().min(1, { message: "Veuillez sélectionner un bail" }),
  additionalTerms: z.string().optional(),
});

const customContractSchema = baseContractSchema.extend({
  contractContent: z
    .string()
    .min(10, { message: "Le contenu du contrat est requis" }),
});

type ContractFormValues =
  | z.infer<typeof fromScratchSchema>
  | z.infer<typeof fromLeaseSchema>
  | z.infer<typeof customContractSchema>;

interface ContractFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  initialData?: Partial<ContractFormValues>;
}

export default function ContractForm({
  onSubmit,
  isLoading = false,
  initialData,
}: ContractFormProps) {
  const { agencyId } = useParams<{ agencyId: string }>();
  const [creationMode, setCreationMode] = useState<
    "fromLease" | "fromScratch" | "custom"
  >("fromScratch");

  // Debug mode for troubleshooting
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    // Log important information on component mount
    console.log("DEBUG: ContractForm mounted with agencyId:", agencyId);
    console.log("DEBUG: Initial creation mode:", creationMode);
  }, []);

  // Access the query client for manual invalidation
  const queryClient = useQueryClient();

  // Fetch tenants for the agency
  const {
    data: tenantsData,
    isLoading: isLoadingTenants,
    error: tenantsError,
  } = useQuery({
    queryKey: ["tenants", agencyId],
    queryFn: async () => {
      try {
        console.log("Fetching tenants for agency:", agencyId);
        const { data, error } = await supabase
          .from("tenants")
          .select("id, name")
          .eq("agency_id", agencyId);

        if (error) {
          console.error("Error fetching tenants:", error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Error in tenants query:", error);
        throw error;
      }
    },
    enabled: !!agencyId,
    retry: 1,
  });

  // Fetch properties for the agency
  const {
    data: propertiesData,
    isLoading: isLoadingProperties,
    error: propertiesError,
  } = useQuery({
    queryKey: ["properties", agencyId],
    queryFn: async () => {
      try {
        console.log("Fetching properties for agency:", agencyId);
        const { data, error } = await supabase
          .from("properties")
          .select("id, name, address")
          .eq("agency_id", agencyId);

        if (error) {
          console.error("Error fetching properties:", error);
          throw error;
        }
        return (
          data?.map((p) => ({
            id: p.id,
            name: p.name || `Propriété ${p.id}`,
            address: p.address,
          })) || []
        );
      } catch (error) {
        console.error("Error in properties query:", error);
        throw error;
      }
    },
    enabled: !!agencyId,
    retry: 1,
  });

  // Fetch leases for the agency
  const {
    data: leasesData,
    isLoading: isLoadingLeases,
    error: leasesError,
    refetch: refetchLeases,
  } = useQuery({
    queryKey: ["leases", agencyId, creationMode],
    queryFn: async () => {
      try {
        console.log("DEBUG: Fetching leases for agency:", agencyId);

        // Direct query approach - simplest possible query to get all needed data
        // This avoids complex joins that might fail
        const { data: directLeases, error: directError } = await supabase
          .from("leases")
          .select("*")
          .eq("agency_id", agencyId);

        if (directError) {
          console.error("DEBUG: Direct lease query error:", directError);

          // Try alternative query without agency_id filter as fallback
          console.log("DEBUG: Trying fallback query without agency_id filter");
          const { data: allLeases, error: allLeasesError } = await supabase
            .from("leases")
            .select("*");

          if (allLeasesError) {
            console.error("DEBUG: All leases query error:", allLeasesError);
            throw new Error(
              `Erreur d'accès à la table des baux: ${allLeasesError.message}`,
            );
          }

          console.log(
            "DEBUG: All leases query returned",
            allLeases?.length || 0,
            "records",
          );

          // If we got leases but none match our agency, it might be an agency_id mismatch
          if (allLeases && allLeases.length > 0) {
            console.log(
              "DEBUG: Found leases but none for this agency ID. Agency ID might be incorrect.",
            );
            console.log(
              "DEBUG: Available agency_ids in leases:",
              [...new Set(allLeases.map((l) => l.agency_id))].filter(Boolean),
            );

            // Return all leases if we can't filter by agency (better than nothing)
            return processLeaseData(allLeases);
          }

          throw new Error(
            `Erreur lors de la récupération des baux: ${directError.message}`,
          );
        }

        console.log(
          "DEBUG: Lease query successful, found",
          directLeases?.length || 0,
          "leases",
        );

        if (!directLeases || directLeases.length === 0) {
          console.log("DEBUG: No leases found for agency:", agencyId);
          return [];
        }

        return processLeaseData(directLeases);
      } catch (error) {
        console.error("DEBUG: Fatal error in lease query:", error);
        throw error;
      }
    },
    enabled: !!agencyId && creationMode === "fromLease",
    retry: 2,
    retryDelay: 1000,
    staleTime: 0, // Always fetch fresh data
  });

  // Helper function to process lease data and fetch related entities
  const processLeaseData = async (leases) => {
    try {
      if (!leases || leases.length === 0) return [];

      console.log("DEBUG: Processing", leases.length, "leases");

      // Format lease data with tenant and property names
      const formattedLeases = [];

      // Process each lease individually to ensure we get all related data
      for (const lease of leases) {
        console.log(
          "DEBUG: Processing individual lease",
          lease.id,
          "tenant_id:",
          lease.tenant_id,
          "property_id:",
          lease.property_id,
        );

        // Fetch tenant data directly using tenant_id
        let tenantName = "Non spécifié";
        if (lease.tenant_id) {
          try {
            console.log("DEBUG: Fetching tenant with ID:", lease.tenant_id);
            const { data: tenantData, error: tenantError } = await supabase
              .from("tenants")
              .select("id, name")
              .eq("id", lease.tenant_id)
              .single();

            if (tenantError) {
              console.error("DEBUG: Error fetching tenant:", tenantError);
            } else if (tenantData) {
              console.log("DEBUG: Found tenant:", tenantData);
              tenantName = tenantData.name || "Non spécifié";
            } else {
              console.log("DEBUG: No tenant found with ID:", lease.tenant_id);
            }
          } catch (tenantFetchError) {
            console.error(
              "DEBUG: Exception fetching tenant:",
              tenantFetchError,
            );
          }
        }

        // Fetch property data directly using property_id
        let propertyName = "Non spécifié";
        let propertyAddress = "";
        if (lease.property_id) {
          try {
            console.log("DEBUG: Fetching property with ID:", lease.property_id);
            const { data: propertyData, error: propertyError } = await supabase
              .from("properties")
              .select("id, name, address")
              .eq("id", lease.property_id)
              .single();

            if (propertyError) {
              console.error("DEBUG: Error fetching property:", propertyError);
            } else if (propertyData) {
              console.log("DEBUG: Found property:", propertyData);
              propertyName = propertyData.name || "Non spécifié";
              propertyAddress = propertyData.address || "";
            } else {
              console.log(
                "DEBUG: No property found with ID:",
                lease.property_id,
              );
            }
          } catch (propertyFetchError) {
            console.error(
              "DEBUG: Exception fetching property:",
              propertyFetchError,
            );
          }
        }

        // Create formatted lease object with all available data
        formattedLeases.push({
          id: lease.id,
          name: `Bail - ${propertyName || lease.property_id || "Propriété"} - ${tenantName || lease.tenant_id || "Locataire"}`,
          tenant_id: lease.tenant_id,
          property_id: lease.property_id,
          start_date: lease.start_date,
          end_date: lease.end_date,
          tenant_name: tenantName,
          property_name: propertyName,
          property_address: propertyAddress,
          // Include all original lease data for debugging
          raw_lease: lease,
        });
      }

      console.log("DEBUG: Formatted leases:", formattedLeases);
      return formattedLeases;
    } catch (error) {
      console.error("DEBUG: Error processing lease data:", error);
      // Return raw leases as fallback
      return leases.map((lease) => ({
        id: lease.id,
        name: `Bail ID: ${lease.id}`,
        tenant_id: lease.tenant_id,
        property_id: lease.property_id,
        start_date: lease.start_date,
        end_date: lease.end_date,
        tenant_name: "Données non disponibles",
        property_name: "Données non disponibles",
        raw_lease: lease,
      }));
    }
  };

  // Use fetched data or fallback to empty arrays
  const tenants = tenantsData || [];
  const properties = propertiesData || [];
  const leases = leasesData || [];

  // Create form with dynamic schema based on creation mode
  const getFormSchema = () => {
    switch (creationMode) {
      case "fromLease":
        return fromLeaseSchema;
      case "custom":
        return customContractSchema;
      case "fromScratch":
      default:
        return fromScratchSchema;
    }
  };

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(getFormSchema()),
    defaultValues: {
      title: initialData?.title || "",
      type: initialData?.type || "lease",
      ...(creationMode === "fromScratch" && {
        tenant: initialData?.tenant || "",
        property: initialData?.property || "",
        startDate: initialData?.startDate || "",
        endDate: initialData?.endDate || "",
        additionalTerms: initialData?.additionalTerms || "",
      }),
      ...(creationMode === "fromLease" && {
        leaseId: "",
        additionalTerms: initialData?.additionalTerms || "",
      }),
      ...(creationMode === "custom" && {
        contractContent: "",
      }),
    },
  });

  // Reset form when creation mode changes
  useEffect(() => {
    form.reset({
      title: form.getValues("title"),
      type: form.getValues("type"),
      ...(creationMode === "fromScratch" && {
        tenant: "",
        property: "",
        startDate: "",
        endDate: "",
        additionalTerms: "",
      }),
      ...(creationMode === "fromLease" && {
        leaseId: "",
        additionalTerms: "",
      }),
      ...(creationMode === "custom" && {
        contractContent: "",
      }),
    });
  }, [creationMode, form]);

  // Handle lease selection and auto-populate fields
  const handleLeaseChange = async (leaseId: string) => {
    try {
      console.log("DEBUG: Selecting lease with ID:", leaseId);
      console.log(
        "DEBUG: Available leases:",
        leases.map((l) => ({ id: l.id, name: l.name })),
      );

      const selectedLease = leases.find((lease) => lease.id === leaseId);
      if (selectedLease) {
        form.setValue("leaseId", leaseId);

        // Fetch fresh tenant and property data for this specific lease
        let updatedLeaseData = { ...selectedLease };

        // Fetch tenant data directly
        if (selectedLease.tenant_id) {
          try {
            console.log(
              "DEBUG: Fetching fresh tenant data for ID:",
              selectedLease.tenant_id,
            );
            const { data: tenantData, error: tenantError } = await supabase
              .from("tenants")
              .select("id, name")
              .eq("id", selectedLease.tenant_id)
              .single();

            if (!tenantError && tenantData) {
              updatedLeaseData.tenant_name = tenantData.name;
              console.log("DEBUG: Updated tenant name to:", tenantData.name);
            }
          } catch (e) {
            console.error("DEBUG: Error fetching fresh tenant data:", e);
          }
        }

        // Fetch property data directly
        if (selectedLease.property_id) {
          try {
            console.log(
              "DEBUG: Fetching fresh property data for ID:",
              selectedLease.property_id,
            );
            const { data: propertyData, error: propertyError } = await supabase
              .from("properties")
              .select("id, name, address")
              .eq("id", selectedLease.property_id)
              .single();

            if (!propertyError && propertyData) {
              updatedLeaseData.property_name = propertyData.name;
              updatedLeaseData.property_address = propertyData.address;
              console.log("DEBUG: Updated property data:", propertyData);
            }
          } catch (e) {
            console.error("DEBUG: Error fetching fresh property data:", e);
          }
        }

        // Store the updated lease data for display
        setSelectedLeaseData(updatedLeaseData);
        console.log(
          "DEBUG: Selected lease data with refreshed tenant/property:",
          updatedLeaseData,
        );

        // Show success toast
        toast.success("Bail sélectionné avec succès");
      } else {
        console.warn("DEBUG: Selected lease not found in leases array", {
          leaseId,
          availableLeaseIds: leases.map((l) => l.id),
        });
        toast.error("Bail introuvable dans la liste disponible");
      }
    } catch (error) {
      console.error("DEBUG: Error in handleLeaseChange:", error);
      toast.error("Erreur lors de la sélection du bail");
    }
  };

  // State to store the selected lease data
  const [selectedLeaseData, setSelectedLeaseData] = useState<any>(null);

  const handleSubmit = (data: ContractFormValues) => {
    // Add creation mode to the submitted data
    const submissionData = {
      ...data,
      creationMode,
    };
    onSubmit(submissionData);
  };

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">
          {initialData ? "Modifier le contrat" : "Créer un nouveau contrat"}
        </CardTitle>
        <CardDescription>
          Choisissez comment vous souhaitez créer votre contrat
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            {/* Contract Creation Mode Selection */}
            <div className="mb-6 border rounded-lg p-4 bg-muted/10">
              <FormLabel className="block mb-3 text-base font-medium">
                Mode de création
              </FormLabel>
              <RadioGroup
                defaultValue={creationMode}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                onValueChange={(value) =>
                  setCreationMode(
                    value as "fromLease" | "fromScratch" | "custom",
                  )
                }
              >
                <div
                  className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-all ${creationMode === "fromLease" ? "border-primary bg-primary/5" : "bg-background"}`}
                >
                  <RadioGroupItem
                    value="fromLease"
                    id="fromLease"
                    className="mt-1"
                  />
                  <div>
                    <label
                      htmlFor="fromLease"
                      className="block font-medium cursor-pointer"
                    >
                      Basé sur un bail existant
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Créer un contrat à partir d'un bail déjà enregistré
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-all ${creationMode === "fromScratch" ? "border-primary bg-primary/5" : "bg-background"}`}
                >
                  <RadioGroupItem
                    value="fromScratch"
                    id="fromScratch"
                    className="mt-1"
                  />
                  <div>
                    <label
                      htmlFor="fromScratch"
                      className="block font-medium cursor-pointer"
                    >
                      Nouveau contrat standard
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Créer un contrat avec nos modèles prédéfinis
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-all ${creationMode === "custom" ? "border-primary bg-primary/5" : "bg-background"}`}
                >
                  <RadioGroupItem value="custom" id="custom" className="mt-1" />
                  <div>
                    <label
                      htmlFor="custom"
                      className="block font-medium cursor-pointer"
                    >
                      Contrat personnalisé
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Créer un contrat entièrement personnalisé
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du contrat</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contrat de location - Appartement 101"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Donnez un titre descriptif à votre contrat
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de contrat</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type de contrat" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lease">
                          Contrat de location
                        </SelectItem>
                        <SelectItem value="commercial">
                          Bail commercial
                        </SelectItem>
                        <SelectItem value="seasonal">
                          Location saisonnière
                        </SelectItem>
                        <SelectItem value="custom">
                          Contrat personnalisé
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Conditional Fields Based on Creation Mode */}
            {creationMode === "fromLease" && (
              <div className="border rounded-lg p-6 bg-muted/5">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Sélection du bail
                </h3>

                {isLoadingLeases ? (
                  <div className="flex items-center justify-center p-6 border rounded-md bg-muted/5">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <p>Chargement des baux...</p>
                  </div>
                ) : leasesError ? (
                  <div className="flex flex-col p-4 border rounded-md bg-destructive/10 text-destructive">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <p className="font-medium">
                        Erreur lors du chargement des baux
                      </p>
                    </div>
                    <p className="text-sm">
                      {leasesError.message ||
                        "Veuillez réessayer ou contacter l'administrateur."}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="self-start"
                        onClick={() => refetchLeases()}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" /> Réessayer
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="self-start"
                        onClick={() => {
                          // Switch to another creation mode as fallback
                          setCreationMode("fromScratch");
                          toast.info(
                            "Mode de création changé en 'Nouveau contrat standard'",
                          );
                        }}
                      >
                        Utiliser un autre mode
                      </Button>
                    </div>
                  </div>
                ) : leases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 border rounded-md bg-muted/5">
                    <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-center">
                      Aucun bail disponible pour cette agence.
                    </p>
                    <p className="text-sm text-muted-foreground text-center mt-1">
                      Veuillez d'abord créer un bail pour pouvoir l'utiliser
                      comme base pour un contrat.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        // Force refetch in case data was added recently
                        refetchLeases();
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" /> Actualiser
                    </Button>
                  </div>
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="leaseId"
                      render={({ field }) => (
                        <FormItem className="mb-6">
                          <FormLabel>Bail existant</FormLabel>
                          <Select
                            onValueChange={(value) => handleLeaseChange(value)}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un bail existant" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {leases.map((lease) => (
                                <SelectItem key={lease.id} value={lease.id}>
                                  {lease.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Le contrat sera automatiquement lié à ce bail
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedLeaseData && (
                      <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/10 p-4 rounded-md">
                          <div>
                            <p className="text-sm font-medium">Locataire</p>
                            <div className="flex items-center">
                              <p className="text-muted-foreground">
                                {selectedLeaseData.tenant_name ||
                                  "Non spécifié"}
                              </p>
                              {selectedLeaseData.tenant_id &&
                                !selectedLeaseData.tenant_name && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 h-6 text-xs"
                                    onClick={async () => {
                                      try {
                                        const { data, error } = await supabase
                                          .from("tenants")
                                          .select("id, name")
                                          .eq("id", selectedLeaseData.tenant_id)
                                          .single();

                                        if (data) {
                                          setSelectedLeaseData((prev) => ({
                                            ...prev,
                                            tenant_name: data.name,
                                          }));
                                          toast.success(
                                            "Informations du locataire récupérées",
                                          );
                                        } else {
                                          toast.error(
                                            "Impossible de récupérer les informations du locataire",
                                          );
                                        }
                                      } catch (e) {
                                        console.error(
                                          "Error fetching tenant:",
                                          e,
                                        );
                                        toast.error(
                                          "Erreur lors de la récupération du locataire",
                                        );
                                      }
                                    }}
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />{" "}
                                    Récupérer
                                  </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              ID: {selectedLeaseData.tenant_id || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Propriété</p>
                            <div className="flex items-center">
                              <p className="text-muted-foreground">
                                {selectedLeaseData.property_name ||
                                  "Non spécifié"}
                              </p>
                              {selectedLeaseData.property_id &&
                                !selectedLeaseData.property_name && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 h-6 text-xs"
                                    onClick={async () => {
                                      try {
                                        const { data, error } = await supabase
                                          .from("properties")
                                          .select("id, name, address")
                                          .eq(
                                            "id",
                                            selectedLeaseData.property_id,
                                          )
                                          .single();

                                        if (data) {
                                          setSelectedLeaseData((prev) => ({
                                            ...prev,
                                            property_name: data.name,
                                            property_address: data.address,
                                          }));
                                          toast.success(
                                            "Informations de la propriété récupérées",
                                          );
                                        } else {
                                          toast.error(
                                            "Impossible de récupérer les informations de la propriété",
                                          );
                                        }
                                      } catch (e) {
                                        console.error(
                                          "Error fetching property:",
                                          e,
                                        );
                                        toast.error(
                                          "Erreur lors de la récupération de la propriété",
                                        );
                                      }
                                    }}
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />{" "}
                                    Récupérer
                                  </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              ID: {selectedLeaseData.property_id || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Date de début</p>
                            <p className="text-muted-foreground">
                              {selectedLeaseData.start_date || "Non spécifié"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Date de fin</p>
                            <p className="text-muted-foreground">
                              {selectedLeaseData.end_date || "Non spécifié"}
                            </p>
                          </div>
                        </div>

                        {/* Debug information - can be removed in production */}
                        <details
                          className="text-xs border rounded-md p-2 bg-muted/5"
                          open
                        >
                          <summary className="font-medium cursor-pointer">
                            Informations techniques (debug)
                          </summary>
                          <div className="mt-2 space-y-1 overflow-auto max-h-40 p-2 bg-muted/10 rounded">
                            <p>
                              <span className="font-semibold">ID du bail:</span>{" "}
                              {selectedLeaseData.id}
                            </p>
                            <p>
                              <span className="font-semibold">
                                ID du locataire:
                              </span>{" "}
                              {selectedLeaseData.tenant_id}
                            </p>
                            <p>
                              <span className="font-semibold">
                                ID de la propriété:
                              </span>{" "}
                              {selectedLeaseData.property_id}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="text-xs"
                                onClick={async () => {
                                  try {
                                    // Refresh both tenant and property data
                                    const [tenantResult, propertyResult] =
                                      await Promise.all([
                                        supabase
                                          .from("tenants")
                                          .select("id, name")
                                          .eq("id", selectedLeaseData.tenant_id)
                                          .single(),
                                        supabase
                                          .from("properties")
                                          .select("id, name, address")
                                          .eq(
                                            "id",
                                            selectedLeaseData.property_id,
                                          )
                                          .single(),
                                      ]);

                                    const updatedData = {
                                      ...selectedLeaseData,
                                    };
                                    let updated = false;

                                    if (tenantResult.data) {
                                      updatedData.tenant_name =
                                        tenantResult.data.name;
                                      updated = true;
                                    }

                                    if (propertyResult.data) {
                                      updatedData.property_name =
                                        propertyResult.data.name;
                                      updatedData.property_address =
                                        propertyResult.data.address;
                                      updated = true;
                                    }

                                    if (updated) {
                                      setSelectedLeaseData(updatedData);
                                      toast.success(
                                        "Données rafraîchies avec succès",
                                      );
                                    } else {
                                      toast.error(
                                        "Aucune donnée n'a pu être récupérée",
                                      );
                                    }
                                  } catch (e) {
                                    console.error("Error refreshing data:", e);
                                    toast.error(
                                      "Erreur lors du rafraîchissement des données",
                                    );
                                  }
                                }}
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />{" "}
                                Rafraîchir les données
                              </Button>
                            </div>
                            {selectedLeaseData.raw_lease && (
                              <pre className="whitespace-pre-wrap break-all">
                                {JSON.stringify(
                                  selectedLeaseData.raw_lease,
                                  null,
                                  2,
                                )}
                              </pre>
                            )}
                          </div>
                        </details>
                      </div>
                    )}
                  </>
                )}

                <FormField
                  control={form.control}
                  name="additionalTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clauses additionnelles</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ajoutez des clauses ou conditions spécifiques à ce contrat..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Ces clauses seront ajoutées à la fin du contrat généré
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {creationMode === "fromScratch" && (
              <div className="border rounded-lg p-6 bg-muted/5">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Informations du contrat
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <FormField
                    control={form.control}
                    name="tenant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Locataire</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un locataire" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingTenants ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Chargement...</span>
                              </div>
                            ) : tenants.length > 0 ? (
                              tenants.map((tenant) => (
                                <SelectItem key={tenant.id} value={tenant.id}>
                                  {tenant.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-center text-muted-foreground">
                                Aucun locataire disponible
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="property"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Propriété</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une propriété" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingProperties ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Chargement...</span>
                              </div>
                            ) : properties.length > 0 ? (
                              properties.map((property) => (
                                <SelectItem
                                  key={property.id}
                                  value={property.id}
                                >
                                  {property.name}
                                  {property.address && (
                                    <span className="text-muted-foreground text-xs block">
                                      {property.address}
                                    </span>
                                  )}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-center text-muted-foreground">
                                Aucune propriété disponible
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de début</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de fin</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="additionalTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clauses additionnelles</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ajoutez des clauses ou conditions spécifiques à ce contrat..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Ces clauses seront ajoutées à la fin du contrat généré
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {creationMode === "custom" && (
              <div className="border rounded-lg p-6 bg-muted/5">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <FileEdit className="mr-2 h-5 w-5 text-primary" />
                  Contrat personnalisé
                </h3>

                <FormField
                  control={form.control}
                  name="contractContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu du contrat</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Rédigez votre contrat personnalisé ici..."
                          className="min-h-[300px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Vous pouvez rédiger votre contrat entièrement
                        personnalisé
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t p-6">
            <div className="flex justify-between w-full">
              <Button type="button" variant="outline">
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading} className="px-6">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {initialData ? "Mettre à jour" : "Créer le contrat"}
                  </>
                )}
              </Button>
            </div>

            {/* Debug tools */}
            <div className="w-full">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setDebugMode(!debugMode);
                  if (!debugMode) {
                    toast.info("Mode debug activé", {
                      description:
                        "Les informations techniques sont maintenant visibles",
                    });
                  }
                }}
              >
                <Bug className="h-3 w-3 mr-1" />
                {debugMode ? "Masquer le mode debug" : "Afficher le mode debug"}
              </Button>

              {debugMode && (
                <div className="mt-2 p-3 border rounded-md bg-muted/5 text-xs">
                  <div className="flex items-center mb-2">
                    <Info className="h-4 w-4 mr-1 text-blue-500" />
                    <p className="font-medium">Informations de débogage</p>
                  </div>
                  <div className="space-y-1 overflow-auto max-h-40">
                    <p>
                      <span className="font-semibold">Agency ID:</span>{" "}
                      {agencyId || "Non défini"}
                    </p>
                    <p>
                      <span className="font-semibold">Mode de création:</span>{" "}
                      {creationMode}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Nombre de baux disponibles:
                      </span>{" "}
                      {leases?.length || 0}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Nombre de locataires:
                      </span>{" "}
                      {tenants?.length || 0}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Nombre de propriétés:
                      </span>{" "}
                      {properties?.length || 0}
                    </p>
                    <p>
                      <span className="font-semibold">Bail sélectionné:</span>{" "}
                      {form.watch("leaseId") || "Aucun"}
                    </p>
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          console.log(
                            "DEBUG: Current form values:",
                            form.getValues(),
                          );
                          console.log(
                            "DEBUG: Selected lease data:",
                            selectedLeaseData,
                          );
                          console.log("DEBUG: All leases:", leases);
                          toast.info("Données affichées dans la console");
                        }}
                      >
                        Afficher les données dans la console
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
