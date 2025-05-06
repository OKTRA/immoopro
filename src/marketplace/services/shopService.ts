import { supabase } from "@/lib/supabase";
import { Shop } from "../types";

export const getShops = async (limit = 10, offset = 0, filters?: any) => {
  try {
    let query = supabase
      .from("marketplace_shops")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (filters?.category_id) {
      // Get shops that have products in this category
      const { data: shopIds } = await supabase
        .from("marketplace_products")
        .select("shop_id")
        .eq("category_id", filters.category_id)
        .eq("status", "active");

      if (shopIds && shopIds.length > 0) {
        const uniqueShopIds = [...new Set(shopIds.map((item) => item.shop_id))];
        query = query.in("id", uniqueShopIds);
      }
    }

    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order("name")
      .returns<Shop[]>();

    if (error) {
      console.error("Error fetching shops:", error);
      return { shops: [], count: 0 };
    }

    return { shops: data || [], count };
  } catch (error: any) {
    console.error("Error fetching shops:", error);
    return { shops: [], count: 0 };
  }
};

export const getShopById = async (shopId: string) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_shops")
      .select("*")
      .eq("id", shopId)
      .single();

    if (error) {
      console.error("Error fetching shop:", error);
      return { shop: null, error: "Boutique non trouvée" };
    }

    return { shop: data as Shop };
  } catch (error: any) {
    console.error("Error fetching shop:", error);
    return { shop: null, error: "Boutique non trouvée" };
  }
};

export const getShopsByAgencyId = async (agencyId: string) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_shops")
      .select("*")
      .eq("agency_id", agencyId)
      .order("name");

    if (error) throw error;

    return { shops: data as Shop[] };
  } catch (error: any) {
    console.error("Error fetching agency shops:", error);
    return { shops: [], error: error.message };
  }
};

// No need to ensure tables exist anymore - they are created directly in migrations
const ensureMarketplaceTables = async (): Promise<boolean> => {
  // Tables are already created in migrations
  return true;
};

// Alias for backward compatibility
const ensureMarketplaceShopsTable = ensureMarketplaceTables;

// Check if the current user has the required role to create a shop
const checkUserRole = async (userId: string): Promise<boolean> => {
  try {
    // Get user profile to check role
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking user role:", error);
      return false;
    }

    // Check if user has a valid role (agency, owner, or admin)
    return (
      profile &&
      (profile.role === "agency" ||
        profile.role === "owner" ||
        profile.role === "admin")
    );
  } catch (error) {
    console.error("Exception checking user role:", error);
    return false;
  }
};

// Professional function to create a shop with proper error handling
export const createShopPersistent = async (shopData: Partial<Shop>) => {
  try {
    console.log("Creating shop with data:", shopData);

    // Make sure we have the required fields
    if (!shopData.name || !shopData.description || !shopData.owner_id) {
      return {
        shop: null,
        error: "Nom, description et propriétaire sont requis",
      };
    }

    // Check if user has the required role
    const hasValidRole = await checkUserRole(shopData.owner_id);
    if (!hasValidRole) {
      return {
        shop: null,
        error: "Vous n'avez pas les droits nécessaires pour créer une boutique",
      };
    }

    // Add created_at and updated_at fields
    const now = new Date().toISOString();
    const shopWithTimestamps = {
      ...shopData,
      created_at: now,
      updated_at: now,
      agency_id: null, // Explicitly set to null to avoid RLS issues
      status: shopData.status || "active",
      rating: shopData.rating || 0,
      total_products: shopData.total_products || 0,
    };

    // Try to insert the shop
    try {
      const { data, error } = await supabase
        .from("marketplace_shops")
        .insert([shopWithTimestamps])
        .select()
        .single();

      if (!error) {
        console.log("Shop created successfully:", data);
        return { shop: data as Shop, error: null };
      }

      // Handle error
      if (error) {
        // If we get a 404 error, the table might not exist
        if (error.code === "404" || error.message?.includes("does not exist")) {
          // Try to create the table silently
          const tableCreated = await ensureMarketplaceShopsTable();

          if (tableCreated) {
            // Try insertion again after table creation
            const { data: retryData, error: retryError } = await supabase
              .from("marketplace_shops")
              .insert([shopWithTimestamps])
              .select()
              .single();

            if (!retryError) {
              console.log("Shop created successfully after setup:", retryData);
              return { shop: retryData as Shop, error: null };
            } else {
              console.error("Failed to insert shop after setup:", retryError);
              return {
                shop: null,
                error:
                  "Une erreur est survenue lors de la création de la boutique. Veuillez réessayer.",
              };
            }
          } else {
            return {
              shop: null,
              error:
                "Le service est temporairement indisponible. Veuillez réessayer plus tard.",
            };
          }
        } else {
          // Some other error occurred
          console.error("Error inserting shop:", error);
          return {
            shop: null,
            error:
              "Une erreur est survenue lors de la création de la boutique. Veuillez réessayer.",
          };
        }
      } else {
        console.error("Exception during shop insertion:", error);
        return {
          shop: null,
          error:
            "Une erreur est survenue lors de la création de la boutique. Veuillez réessayer.",
        };
      }
    } catch (insertError: any) {
      console.error("Exception during shop insertion:", insertError);
      return {
        shop: null,
        error:
          "Une erreur est survenue lors de la création de la boutique. Veuillez réessayer.",
      };
    }
  } catch (error: any) {
    console.error("Error in createShopPersistent:", error);
    return {
      shop: null,
      error:
        "Une erreur est survenue lors de la création de la boutique. Veuillez réessayer.",
    };
  }
};

// Use createShopPersistent as the main function for creating shops
export const createShop = createShopPersistent;

export const updateShop = async (shopId: string, shopData: Partial<Shop>) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_shops")
      .update(shopData)
      .eq("id", shopId)
      .select()
      .single();

    if (error) {
      console.error("Error updating shop:", error);
      return {
        shop: null,
        error: "Une erreur est survenue lors de la mise à jour de la boutique",
      };
    }

    return { shop: data as Shop, error: null };
  } catch (error: any) {
    console.error("Error updating shop:", error);
    return {
      shop: null,
      error: "Une erreur est survenue lors de la mise à jour de la boutique",
    };
  }
};

export const deleteShop = async (shopId: string) => {
  try {
    // Instead of actually deleting, we set the status to inactive
    const { error } = await supabase
      .from("marketplace_shops")
      .update({ status: "inactive" })
      .eq("id", shopId);

    if (error) {
      console.error("Error deleting shop:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de la suppression de la boutique",
      };
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting shop:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de la boutique",
    };
  }
};
