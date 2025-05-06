import { supabase } from "@/lib/supabase";
import { Product } from "../types";

export const getProducts = async (limit = 12, offset = 0, filters?: any) => {
  try {
    let query = supabase
      .from("marketplace_products")
      .select("*, marketplace_shops(name, logo_url)")
      .eq("status", "active");

    if (filters?.shop_id) {
      query = query.eq("shop_id", filters.shop_id);
    }

    if (filters?.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    if (filters?.featured) {
      query = query.eq("featured", true);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
      );
    }

    if (filters?.min_price) {
      query = query.gte("price", filters.min_price);
    }

    if (filters?.max_price) {
      query = query.lte("price", filters.max_price);
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false })
      .returns<
        (Product & {
          marketplace_shops: { name: string; logo_url: string | null };
        })[]
      >();

    if (error) throw error;

    // Transform the data to match our Product interface
    const products =
      data?.map((product) => ({
        ...product,
        shop_name: product.marketplace_shops?.name,
        shop_logo: product.marketplace_shops?.logo_url,
      })) || [];

    return { products, count };
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return { products: [], error: error.message, count: 0 };
  }
};

export const getProductById = async (productId: string) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_products")
      .select("*, marketplace_shops(name, logo_url, id)")
      .eq("id", productId)
      .single();

    if (error) throw error;

    // Transform to match our interface
    const product = {
      ...data,
      shop_name: data.marketplace_shops?.name,
      shop_logo: data.marketplace_shops?.logo_url,
      shop_id: data.marketplace_shops?.id,
    };

    return { product };
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return { product: null, error: error.message };
  }
};

export const getProductsByShopId = async (shopId: string, limit = 100) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_products")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { products: data as Product[] };
  } catch (error: any) {
    console.error("Error fetching shop products:", error);
    return { products: [], error: error.message };
  }
};

export const createProduct = async (productData: Partial<Product>) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_products")
      .insert([productData])
      .select()
      .single();

    if (error) throw error;

    return { product: data as Product, error: null };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { product: null, error: error.message };
  }
};

export const updateProduct = async (
  productId: string,
  productData: Partial<Product>,
) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_products")
      .update(productData)
      .eq("id", productId)
      .select()
      .single();

    if (error) throw error;

    return { product: data as Product, error: null };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { product: null, error: error.message };
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    // Instead of actually deleting, we set the status to inactive
    const { error } = await supabase
      .from("marketplace_products")
      .update({ status: "inactive" })
      .eq("id", productId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message };
  }
};

export const getFeaturedProducts = async (limit = 8) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_products")
      .select("*, marketplace_shops(name, logo_url)")
      .eq("status", "active")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Transform the data to match our Product interface
    const products =
      data?.map((product) => ({
        ...product,
        shop_name: product.marketplace_shops?.name,
        shop_logo: product.marketplace_shops?.logo_url,
      })) || [];

    return { products };
  } catch (error: any) {
    console.error("Error fetching featured products:", error);
    return { products: [], error: error.message };
  }
};
