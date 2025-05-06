import { supabase } from "@/lib/supabase";
import { Category } from "../types";

export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("marketplace_categories")
      .select("*")
      .order("name");

    if (error) throw error;

    return { categories: data as Category[] };
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return { categories: [], error: error.message };
  }
};

export const getCategoryById = async (categoryId: string) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_categories")
      .select("*")
      .eq("id", categoryId)
      .single();

    if (error) throw error;

    return { category: data as Category };
  } catch (error: any) {
    console.error("Error fetching category:", error);
    return { category: null, error: error.message };
  }
};

export const createCategory = async (categoryData: Partial<Category>) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_categories")
      .insert([categoryData])
      .select()
      .single();

    if (error) throw error;

    return { category: data as Category, error: null };
  } catch (error: any) {
    console.error("Error creating category:", error);
    return { category: null, error: error.message };
  }
};

export const updateCategory = async (
  categoryId: string,
  categoryData: Partial<Category>,
) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_categories")
      .update(categoryData)
      .eq("id", categoryId)
      .select()
      .single();

    if (error) throw error;

    return { category: data as Category, error: null };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return { category: null, error: error.message };
  }
};

export const deleteCategory = async (categoryId: string) => {
  try {
    const { error } = await supabase
      .from("marketplace_categories")
      .delete()
      .eq("id", categoryId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }
};

export const getMainCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("marketplace_categories")
      .select("*")
      .is("parent_id", null)
      .order("name");

    if (error) throw error;

    return { categories: data as Category[] };
  } catch (error: any) {
    console.error("Error fetching main categories:", error);
    return { categories: [], error: error.message };
  }
};

export const getSubcategories = async (parentId: string) => {
  try {
    const { data, error } = await supabase
      .from("marketplace_categories")
      .select("*")
      .eq("parent_id", parentId)
      .order("name");

    if (error) throw error;

    return { subcategories: data as Category[] };
  } catch (error: any) {
    console.error("Error fetching subcategories:", error);
    return { subcategories: [], error: error.message };
  }
};
