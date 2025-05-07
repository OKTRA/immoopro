import { supabase } from "@/lib/supabase";

// Types
export interface Contract {
  id: string;
  agency_id: string;
  title: string;
  type: string;
  tenant_id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  status: "draft" | "active" | "expired";
  content: string;
  additional_terms?: string;
  created_at: string;
  updated_at: string;
  lease_id?: string;
  is_custom?: boolean;
}

export interface ContractFormData {
  title: string;
  type: string;
  tenant?: string;
  property?: string;
  startDate?: string;
  endDate?: string;
  additionalTerms?: string;
  leaseId?: string;
  isFromLease?: boolean;
  contractContent?: string;
  isCustom?: boolean;
}

/**
 * Get all contracts for an agency
 */
export const getContractsByAgencyId = async (agencyId: string) => {
  try {
    const { data, error, count } = await supabase
      .from("contracts")
      .select("*, tenants(name), properties(name)", { count: "exact" })
      .eq("agency_id", agencyId);

    if (error) throw error;

    return { contracts: data, count, error: null };
  } catch (error: any) {
    console.error("Error getting contracts:", error);
    return { contracts: [], count: 0, error: error.message };
  }
};

/**
 * Get a contract by ID
 */
export const getContractById = async (contractId: string) => {
  try {
    const { data, error } = await supabase
      .from("contracts")
      .select("*, tenants(name), properties(name)")
      .eq("id", contractId)
      .single();

    if (error) throw error;

    return { contract: data, error: null };
  } catch (error: any) {
    console.error("Error getting contract:", error);
    return { contract: null, error: error.message };
  }
};

/**
 * Create a new contract
 */
export const createContract = async (
  agencyId: string,
  contractData: ContractFormData,
) => {
  try {
    let contractContent = "";
    let contractRecord: any = {
      agency_id: agencyId,
      title: contractData.title,
      type: contractData.type,
      status: "draft",
    };

    // Handle different contract creation modes
    if (contractData.isFromLease && contractData.leaseId) {
      // Get lease details
      const { data: leaseData, error: leaseError } = await supabase
        .from("leases")
        .select("*, tenants(*), properties(*)")
        .eq("id", contractData.leaseId)
        .single();

      if (leaseError) throw leaseError;

      contractRecord = {
        ...contractRecord,
        tenant_id: leaseData.tenant_id,
        property_id: leaseData.property_id,
        start_date: leaseData.start_date,
        end_date: leaseData.end_date,
        lease_id: contractData.leaseId,
        additional_terms: contractData.additionalTerms,
      };

      // Generate contract content based on lease
      contractContent = await generateContractContent({
        ...contractData,
        tenant: leaseData.tenant_id,
        property: leaseData.property_id,
        startDate: leaseData.start_date,
        endDate: leaseData.end_date,
      });
    } else if (contractData.isCustom && contractData.contractContent) {
      // Use custom contract content
      contractContent = contractData.contractContent;
      contractRecord = {
        ...contractRecord,
        is_custom: true,
      };
    } else {
      // Standard contract creation
      contractRecord = {
        ...contractRecord,
        tenant_id: contractData.tenant,
        property_id: contractData.property,
        start_date: contractData.startDate,
        end_date: contractData.endDate,
        additional_terms: contractData.additionalTerms,
      };

      // Generate contract content
      contractContent = await generateContractContent(contractData);
    }

    // Add content to record
    contractRecord.content = contractContent;

    // Insert into database
    const { data, error } = await supabase
      .from("contracts")
      .insert([contractRecord])
      .select()
      .single();

    if (error) throw error;

    return { contract: data, error: null };
  } catch (error: any) {
    console.error("Error creating contract:", error);
    return { contract: null, error: error.message };
  }
};

/**
 * Update an existing contract
 */
export const updateContract = async (
  contractId: string,
  contractData: Partial<ContractFormData>,
) => {
  try {
    // Get current contract data
    const { contract } = await getContractById(contractId);
    if (!contract) throw new Error("Contract not found");

    // Prepare update data
    const updateData: any = {};
    if (contractData.title) updateData.title = contractData.title;
    if (contractData.type) updateData.type = contractData.type;

    // Handle different contract types
    if (contract.is_custom && contractData.contractContent) {
      // Update custom contract content directly
      updateData.content = contractData.contractContent;
    } else if (contract.lease_id && contractData.additionalTerms) {
      // Update lease-based contract
      updateData.additional_terms = contractData.additionalTerms;

      // Regenerate content if needed
      if (contractData.additionalTerms !== contract.additional_terms) {
        const fullContractData = {
          title: contractData.title || contract.title,
          type: contractData.type || contract.type,
          leaseId: contract.lease_id,
          additionalTerms: contractData.additionalTerms,
          isFromLease: true,
        };
        updateData.content = await generateContractContent(fullContractData);
      }
    } else {
      // Update standard contract
      if (contractData.tenant) updateData.tenant_id = contractData.tenant;
      if (contractData.property) updateData.property_id = contractData.property;
      if (contractData.startDate)
        updateData.start_date = contractData.startDate;
      if (contractData.endDate) updateData.end_date = contractData.endDate;
      if (contractData.additionalTerms)
        updateData.additional_terms = contractData.additionalTerms;

      // Regenerate content if key fields changed
      if (
        contractData.tenant ||
        contractData.property ||
        contractData.startDate ||
        contractData.endDate ||
        contractData.additionalTerms ||
        contractData.type
      ) {
        const fullContractData = {
          title: contractData.title || contract.title,
          type: contractData.type || contract.type,
          tenant: contractData.tenant || contract.tenant_id,
          property: contractData.property || contract.property_id,
          startDate: contractData.startDate || contract.start_date,
          endDate: contractData.endDate || contract.end_date,
          additionalTerms:
            contractData.additionalTerms || contract.additional_terms,
        };

        updateData.content = await generateContractContent(fullContractData);
      }
    }

    // Update the contract
    const { data, error } = await supabase
      .from("contracts")
      .update(updateData)
      .eq("id", contractId)
      .select()
      .single();

    if (error) throw error;

    return { contract: data, error: null };
  } catch (error: any) {
    console.error("Error updating contract:", error);
    return { contract: null, error: error.message };
  }
};

/**
 * Delete a contract
 */
export const deleteContract = async (contractId: string) => {
  try {
    const { error } = await supabase
      .from("contracts")
      .delete()
      .eq("id", contractId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting contract:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate contract content using DeepSeek API via Supabase Edge Function
 */
async function generateContractContent(
  contractData: ContractFormData,
): Promise<string> {
  try {
    console.log(
      "Calling generate-contract edge function with data:",
      contractData,
    );

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke(
      "generate-contract",
      {
        body: { contractData },
      },
    );

    if (error) {
      console.error("Error calling generate-contract function:", error);
      throw new Error(`Failed to generate contract: ${error.message}`);
    }

    if (!data || !data.content) {
      console.error("Invalid response from generate-contract function:", data);
      throw new Error("Invalid response from contract generation service");
    }

    return data.content;
  } catch (error: any) {
    console.error("Contract generation failed:", error);

    // Fallback to a basic template if the API call fails
    return `
      <h1>${contractData.title}</h1>
      <p>Ce contrat est établi entre les parties concernant la propriété spécifiée.</p>
      <p>Type de contrat: ${contractData.type}</p>
      ${contractData.startDate ? `<p>Date de début: ${contractData.startDate}</p>` : ""}
      ${contractData.endDate ? `<p>Date de fin: ${contractData.endDate}</p>` : ""}
      ${contractData.leaseId ? `<p>Basé sur le bail ID: ${contractData.leaseId}</p>` : ""}
      <h2>Clauses additionnelles</h2>
      <p>${contractData.additionalTerms || "Aucune clause additionnelle"}</p>
      <p class="error-note">Note: Ce contrat est un modèle de base généré suite à une erreur de connexion avec le service de génération.</p>
    `;
  }
}

/**
 * Download contract as Word document
 */
export const downloadContractAsWord = async (contractId: string) => {
  try {
    // Get contract data
    const { contract, error } = await getContractById(contractId);
    if (error || !contract) throw new Error(error || "Contract not found");

    // This would be replaced with actual code to generate a Word document
    console.log("Downloading contract as Word document:", contract.title);

    // Return success
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error downloading contract:", error);
    return { success: false, error: error.message };
  }
};
