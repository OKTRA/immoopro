
import { supabase } from '@/lib/supabase';
import { Tenant } from '@/assets/types';

/**
 * Get all tenants with pagination
 */
export const getAllTenants = async (
  limit = 10,
  offset = 0,
  sortBy = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  try {
    const { data, error, count } = await supabase
      .from('tenants')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { tenants: data, count, error: null };
  } catch (error: any) {
    console.error('Error getting tenants:', error);
    return { tenants: [], count: 0, error: error.message };
  }
};

/**
 * Get a tenant by ID
 */
export const getTenantById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { tenant: data, error: null };
  } catch (error: any) {
    console.error(`Error getting tenant with ID ${id}:`, error);
    return { tenant: null, error: error.message };
  }
};

/**
 * Get tenant by user ID
 */
export const getTenantByUserId = async (userId: string) => {
  try {
    console.log(`Fetching tenant with user ID: ${userId}`);
    
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    
    console.log(`Found tenant for user ID ${userId}:`, data);
    return { tenant: data, error: null };
  } catch (error: any) {
    console.error(`Error getting tenant with user ID ${userId}:`, error);
    return { tenant: null, error: error.message };
  }
};
