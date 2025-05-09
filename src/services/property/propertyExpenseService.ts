import { supabase } from "@/lib/supabase";

export interface PropertyExpense {
  id?: string;
  property_id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  status: string;
  receipt_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all expenses for a specific property
 */
export const getPropertyExpenses = async (propertyId: string) => {
  try {
    const { data, error } = await supabase
      .from("property_expenses")
      .select("*")
      .eq("property_id", propertyId)
      .order("date", { ascending: false });

    if (error) throw error;

    return { expenses: data || [], error: null };
  } catch (error: any) {
    console.error("Error fetching property expenses:", error);
    return { expenses: [], error: error.message };
  }
};

/**
 * Get all expenses for properties in an agency
 */
export const getAgencyPropertyExpenses = async (agencyId: string) => {
  try {
    // First get all properties for this agency
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("id, title, location")
      .eq("agency_id", agencyId);

    if (propertiesError) throw propertiesError;

    if (!properties || properties.length === 0) {
      return { expenses: [], properties: [], error: null };
    }

    // Get all expenses for these properties
    const propertyIds = properties.map((p) => p.id);
    const { data: expenses, error: expensesError } = await supabase
      .from("property_expenses")
      .select("*")
      .in("property_id", propertyIds)
      .order("date", { ascending: false });

    if (expensesError) throw expensesError;

    return {
      expenses: expenses || [],
      properties,
      error: null,
    };
  } catch (error: any) {
    console.error("Error fetching agency property expenses:", error);
    return { expenses: [], properties: [], error: error.message };
  }
};

/**
 * Create a new property expense
 */
export const createPropertyExpense = async (expense: PropertyExpense) => {
  try {
    const { data, error } = await supabase
      .from("property_expenses")
      .insert(expense)
      .select()
      .single();

    if (error) throw error;

    return { expense: data, error: null };
  } catch (error: any) {
    console.error("Error creating property expense:", error);
    return { expense: null, error: error.message };
  }
};

/**
 * Update an existing property expense
 */
export const updatePropertyExpense = async (
  id: string,
  expense: Partial<PropertyExpense>,
) => {
  try {
    const { data, error } = await supabase
      .from("property_expenses")
      .update(expense)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { expense: data, error: null };
  } catch (error: any) {
    console.error("Error updating property expense:", error);
    return { expense: null, error: error.message };
  }
};

/**
 * Delete a property expense
 */
export const deletePropertyExpense = async (id: string) => {
  try {
    const { error } = await supabase
      .from("property_expenses")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Error deleting property expense:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get expense statistics for properties in an agency
 */
export const getAgencyExpenseStats = async (agencyId: string) => {
  try {
    // First get all properties for this agency
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("id")
      .eq("agency_id", agencyId);

    if (propertiesError) throw propertiesError;

    if (!properties || properties.length === 0) {
      return { stats: null, error: "No properties found for this agency" };
    }

    // Get all expenses for these properties
    const propertyIds = properties.map((p) => p.id);
    const { data: expenses, error: expensesError } = await supabase
      .from("property_expenses")
      .select("*")
      .in("property_id", propertyIds);

    if (expensesError) throw expensesError;

    if (!expenses || expenses.length === 0) {
      return {
        stats: {
          totalExpenses: 0,
          maintenanceExpenses: 0,
          utilitiesExpenses: 0,
          taxesExpenses: 0,
          insuranceExpenses: 0,
          otherExpenses: 0,
        },
        error: null,
      };
    }

    // Calculate stats
    let totalExpenses = 0;
    let maintenanceExpenses = 0;
    let utilitiesExpenses = 0;
    let taxesExpenses = 0;
    let insuranceExpenses = 0;
    let otherExpenses = 0;

    expenses.forEach((expense) => {
      const amount = expense.amount || 0;
      totalExpenses += amount;

      switch (expense.category) {
        case "maintenance":
          maintenanceExpenses += amount;
          break;
        case "utilities":
          utilitiesExpenses += amount;
          break;
        case "taxes":
          taxesExpenses += amount;
          break;
        case "insurance":
          insuranceExpenses += amount;
          break;
        default:
          otherExpenses += amount;
      }
    });

    return {
      stats: {
        totalExpenses,
        maintenanceExpenses,
        utilitiesExpenses,
        taxesExpenses,
        insuranceExpenses,
        otherExpenses,
      },
      error: null,
    };
  } catch (error: any) {
    console.error("Error calculating agency expense stats:", error);
    return { stats: null, error: error.message };
  }
};
