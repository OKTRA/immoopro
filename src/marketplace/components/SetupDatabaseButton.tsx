import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Database, Loader2 } from "lucide-react";
import {
  setupMarketplaceTables,
  migrateLocalDataToDatabase,
} from "../services/setupService";

export default function SetupDatabaseButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSetupDatabase = async () => {
    setIsLoading(true);
    try {
      // Setup the database tables
      const { success, message } = await setupMarketplaceTables();

      if (success) {
        toast.success(message);

        // Try to migrate local data
        const migrationResult = await migrateLocalDataToDatabase();
        if (migrationResult.success && migrationResult.details) {
          if (migrationResult.details.length > 0) {
            toast.success(migrationResult.message);
          }
        } else if (!migrationResult.success) {
          toast.error(migrationResult.message);
        }

        // Reload the page to use the new database tables
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(message);
      }
    } catch (error: any) {
      console.error("Error setting up database:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSetupDatabase}
      disabled={isLoading}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {isLoading ? "Configuration..." : "Configurer la base de données"}
    </Button>
  );
}
