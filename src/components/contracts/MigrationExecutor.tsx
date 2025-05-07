import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Database, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MigrationExecutor() {
  const [isLoading, setIsLoading] = useState(false);

  const handleExecuteMigration = async () => {
    setIsLoading(true);
    try {
      // Check if the contracts table exists
      const { data: tableExists, error: checkError } = await supabase
        .rpc("check_table_exists", { table_name: "contracts" })
        .single();

      if (checkError) {
        console.error("Error checking if contracts table exists:", checkError);
        toast.error("Erreur lors de la vérification de la table des contrats");
        return;
      }

      if (tableExists) {
        toast.info("La table des contrats existe déjà");
        return;
      }

      // Execute the migration SQL
      const migrationSql = `
        CREATE TABLE IF NOT EXISTS contracts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
          property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
          start_date DATE,
          end_date DATE,
          status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired')),
          content TEXT NOT NULL,
          additional_terms TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
          lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
          is_custom BOOLEAN DEFAULT false
        );
        
        CREATE INDEX IF NOT EXISTS contracts_agency_id_idx ON contracts(agency_id);
        CREATE INDEX IF NOT EXISTS contracts_tenant_id_idx ON contracts(tenant_id);
        CREATE INDEX IF NOT EXISTS contracts_property_id_idx ON contracts(property_id);
        CREATE INDEX IF NOT EXISTS contracts_status_idx ON contracts(status);
        
        ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own agency contracts" 
        ON contracts 
        FOR SELECT 
        USING (
          auth.uid() IN (
            SELECT owner_id FROM agencies WHERE id = contracts.agency_id
          )
        );
        
        CREATE POLICY "Users can insert contracts for their agencies" 
        ON contracts 
        FOR INSERT 
        WITH CHECK (
          auth.uid() IN (
            SELECT owner_id FROM agencies WHERE id = contracts.agency_id
          )
        );
        
        CREATE POLICY "Users can update their own agency contracts" 
        ON contracts 
        FOR UPDATE 
        USING (
          auth.uid() IN (
            SELECT owner_id FROM agencies WHERE id = contracts.agency_id
          )
        );
        
        CREATE POLICY "Users can delete their own agency contracts" 
        ON contracts 
        FOR DELETE 
        USING (
          auth.uid() IN (
            SELECT owner_id FROM agencies WHERE id = contracts.agency_id
          )
        );
      `;

      const { error: migrationError } = await supabase.rpc("exec_sql", {
        sql: migrationSql,
      });

      if (migrationError) {
        console.error("Error executing migration:", migrationError);
        toast.error(
          `Erreur lors de l'exécution de la migration: ${migrationError.message}`,
        );
        return;
      }

      toast.success(
        "Migration exécutée avec succès. La table des contrats a été créée.",
      );

      // Verify the table was created
      const { data: verifyTable, error: verifyError } = await supabase
        .rpc("check_table_exists", { table_name: "contracts" })
        .single();

      if (verifyError || !verifyTable) {
        console.error("Error verifying contracts table creation:", verifyError);
        toast.error(
          "La migration a été exécutée mais la vérification a échoué",
        );
        return;
      }

      toast.success("Table des contrats vérifiée avec succès!");
    } catch (error: any) {
      console.error("Error executing migration:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExecuteMigration}
      disabled={isLoading}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {isLoading ? "Exécution..." : "Exécuter la migration des contrats"}
    </Button>
  );
}
