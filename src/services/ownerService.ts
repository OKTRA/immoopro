
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { PropertyOwner, OwnerPropertyDetail, OwnerDashboardStats } from '@/assets/types';

/**
 * Get owner by user ID
 */
export const getOwnerByUserId = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('property_owners')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { owner: data, error: null };
  } catch (error: any) {
    console.error(`Error getting owner with user ID ${userId}:`, error);
    return { owner: null, error: error.message };
  }
};

/**
 * Create a new property owner
 */
export const createPropertyOwner = async (ownerData: Omit<PropertyOwner, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('property_owners')
      .insert([ownerData])
      .select()
      .single();

    if (error) throw error;
    return { owner: data, error: null };
  } catch (error: any) {
    console.error('Error creating property owner:', error);
    return { owner: null, error: error.message };
  }
};

/**
 * Update a property owner
 */
export const updatePropertyOwner = async (id: string, ownerData: Partial<PropertyOwner>) => {
  try {
    const { data, error } = await supabase
      .from('property_owners')
      .update(ownerData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { owner: data, error: null };
  } catch (error: any) {
    console.error(`Error updating property owner with ID ${id}:`, error);
    return { owner: null, error: error.message };
  }
};

/**
 * Get owner properties
 */
export const getOwnerProperties = async (ownerId: string) => {
  try {
    const { data, error } = await supabase
      .from('owner_properties_details')
      .select(`
        *,
        properties:property_id (*)
      `)
      .eq('owner_id', ownerId)
      .eq('active', true);

    if (error) throw error;
    return { properties: data, error: null };
  } catch (error: any) {
    console.error(`Error getting properties for owner ${ownerId}:`, error);
    return { properties: [], error: error.message };
  }
};

/**
 * Add a property to an owner
 */
export const addPropertyToOwner = async (propertyDetail: Omit<OwnerPropertyDetail, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('owner_properties_details')
      .insert([propertyDetail])
      .select()
      .single();

    if (error) throw error;
    return { propertyDetail: data, error: null };
  } catch (error: any) {
    console.error('Error adding property to owner:', error);
    return { propertyDetail: null, error: error.message };
  }
};

/**
 * Update owner property detail
 */
export const updateOwnerPropertyDetail = async (
  id: string,
  propertyDetailData: Partial<OwnerPropertyDetail>
) => {
  try {
    const { data, error } = await supabase
      .from('owner_properties_details')
      .update(propertyDetailData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { propertyDetail: data, error: null };
  } catch (error: any) {
    console.error(`Error updating owner property detail with ID ${id}:`, error);
    return { propertyDetail: null, error: error.message };
  }
};

/**
 * Get owner dashboard stats
 */
export const getOwnerDashboardStats = async (ownerId: string) => {
  try {
    const { data, error } = await supabase
      .from('owner_dashboard_stats')
      .select('*')
      .eq('owner_id', ownerId)
      .single();

    if (error) throw error;
    return { stats: data, error: null };
  } catch (error: any) {
    console.error(`Error getting dashboard stats for owner ${ownerId}:`, error);
    return { stats: null, error: error.message };
  }
};

/**
 * Get owner revenue
 */
export const getOwnerRevenue = async (
  ownerId: string,
  year: number,
  month?: string
) => {
  try {
    let query = supabase
      .from('owner_monthly_revenue')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('year', year);
    
    if (month) {
      query = query.eq('month', month);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    return { revenue: data, error: null };
  } catch (error: any) {
    console.error(`Error getting revenue for owner ${ownerId}:`, error);
    return { revenue: [], error: error.message };
  }
};

/**
 * Get owner expenses
 */
export const getOwnerExpenses = async (
  ownerId: string,
  year: number,
  month?: string
) => {
  try {
    let query = supabase
      .from('owner_expenses_view')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('year', year);
    
    if (month) {
      query = query.eq('month', month);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    return { expenses: data, error: null };
  } catch (error: any) {
    console.error(`Error getting expenses for owner ${ownerId}:`, error);
    return { expenses: [], error: error.message };
  }
};

/**
 * Get owner statements
 */
export const getOwnerStatements = async (
  ownerId: string,
  limit = 12,
  offset = 0
) => {
  try {
    const { data, error, count } = await supabase
      .from('owner_statements')
      .select('*', { count: 'exact' })
      .eq('owner_id', ownerId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { statements: data, count, error: null };
  } catch (error: any) {
    console.error(`Error getting statements for owner ${ownerId}:`, error);
    return { statements: [], count: 0, error: error.message };
  }
};
