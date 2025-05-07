import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import ContractForm from "@/components/contracts/ContractForm";
import MigrationExecutor from "@/components/contracts/MigrationExecutor";
import { createContract } from "@/services/contracts/contractService";
import { supabase } from "@/lib/supabase";

export default function CreateContractPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);

  // Check if contracts table exists
  useEffect(() => {
    const checkContractsTable = async () => {
      try {
        const { error } = await supabase
          .from("contracts")
          .select("id")
          .limit(1);

        // If there's a 404 error, the table doesn't exist
        setNeedsMigration(
          error?.code === "PGRST116" ||
            error?.message?.includes('relation "contracts" does not exist'),
        );
      } catch (error) {
        console.error("Error checking contracts table:", error);
        setNeedsMigration(true); // Assume migration is needed if check fails
      }
    };

    checkContractsTable();
  }, []);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      console.log("Creating contract with data:", data);

      // Process data based on creation mode
      let contractData;

      switch (data.creationMode) {
        case "fromLease":
          contractData = {
            title: data.title,
            type: data.type,
            leaseId: data.leaseId,
            additionalTerms: data.additionalTerms,
            isFromLease: true,
          };
          break;

        case "custom":
          contractData = {
            title: data.title,
            type: data.type,
            contractContent: data.contractContent,
            isCustom: true,
          };
          break;

        case "fromScratch":
        default:
          contractData = {
            title: data.title,
            type: data.type,
            tenant: data.tenant,
            property: data.property,
            startDate: data.startDate,
            endDate: data.endDate,
            additionalTerms: data.additionalTerms,
          };
      }

      // Call the contract service
      if (agencyId) {
        try {
          // Call the actual API instead of simulating
          const result = await createContract(agencyId, contractData);

          if (result.error) {
            throw new Error(result.error);
          }

          toast.success("Contrat créé avec succès");
          navigate(`/agencies/${agencyId}/contracts`);
        } catch (apiError) {
          console.error("API error creating contract:", apiError);
          throw apiError;
        }
      } else {
        throw new Error("ID d'agence manquant");
      }
    } catch (error: any) {
      console.error("Error creating contract:", error);
      toast.error(
        `Erreur lors de la création du contrat: ${error.message || "Une erreur est survenue"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/agencies/${agencyId}/contracts`)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Créer un nouveau contrat</h1>
          <p className="text-muted-foreground">
            Choisissez le type de contrat et remplissez les informations
            nécessaires
          </p>
        </div>
      </div>

      {needsMigration ? <MigrationExecutor /> : null}

      <ContractForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
