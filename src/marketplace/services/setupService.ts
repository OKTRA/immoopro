import { supabase } from "@/lib/supabase";

/**
 * Function to check if a table exists in the database
 */
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Try to select a single row from the table
    const { data, error } = await supabase
      .from(tableName)
      .select("id")
      .limit(1);

    // If there's no error, the table exists
    if (!error) {
      return true;
    }

    // Check if the error is because the table doesn't exist
    if (
      error.code === "42P01" || // PostgreSQL code for undefined_table
      error.message?.includes("does not exist") ||
      error.message?.includes("relation") ||
      error.code === "404"
    ) {
      return false;
    }

    // For other errors, assume the table exists but there's a permission issue
    console.warn(`Error checking if table ${tableName} exists:`, error);
    return true;
  } catch (error) {
    console.error(`Exception checking if table ${tableName} exists:`, error);
    // If we can't check, assume it exists
    return true;
  }
};

/**
 * Function to setup the marketplace tables
 */
export const setupMarketplaceTables = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Check if the user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message:
          "Vous devez être connecté pour configurer les tables du marketplace",
      };
    }

    // Check if the marketplace_shops table exists
    const shopsTableExists = await checkTableExists("marketplace_shops");

    if (shopsTableExists) {
      return {
        success: true,
        message: "Les tables du marketplace existent déjà",
      };
    }

    // Call the Edge Function to create the tables
    const { data, error } = await supabase.functions.invoke(
      "create_marketplace_tables",
    );

    if (error) {
      console.error(
        "Error invoking create_marketplace_tables function:",
        error,
      );
      return {
        success: false,
        message: `Erreur lors de la création des tables: ${error.message}`,
      };
    }

    return {
      success: true,
      message: "Tables du marketplace créées avec succès",
    };
  } catch (error: any) {
    console.error("Exception in setupMarketplaceTables:", error);
    return {
      success: false,
      message: `Erreur lors de la configuration des tables: ${error.message}`,
    };
  }
};

/**
 * Function to migrate data from localStorage to database
 */
export const migrateLocalDataToDatabase = async () => {
  try {
    // Check if localStorage has shop data
    const localShopsJson = localStorage.getItem("marketplace_shops");
    if (!localShopsJson) {
      return { success: true, message: "Aucune donnée locale à migrer" };
    }

    const localShops = JSON.parse(localShopsJson);
    if (!localShops.length) {
      return { success: true, message: "Aucune donnée locale à migrer" };
    }

    // Check if the marketplace_shops table exists
    const shopsTableExists = await checkTableExists("marketplace_shops");
    if (!shopsTableExists) {
      return {
        success: false,
        message:
          "La table marketplace_shops n'existe pas encore. Impossible de migrer les données.",
      };
    }

    // Migrate each shop
    const results = [];
    for (const shop of localShops) {
      // Remove the id as Supabase will generate a new one
      const { id, ...shopData } = shop;

      // Insert the shop into the database
      const { data, error } = await supabase
        .from("marketplace_shops")
        .insert([shopData])
        .select()
        .single();

      if (error) {
        results.push({ success: false, shop: shop.name, error: error.message });
      } else {
        results.push({ success: true, shop: shop.name, newId: data.id });
      }
    }

    // Clear localStorage after migration
    localStorage.removeItem("marketplace_shops");

    return {
      success: true,
      message: `${results.filter((r) => r.success).length}/${localShops.length} boutiques migrées avec succès`,
      details: results,
    };
  } catch (error: any) {
    console.error("Exception in migrateLocalDataToDatabase:", error);
    return {
      success: false,
      message: `Erreur lors de la migration des données: ${error.message}`,
    };
  }
};
