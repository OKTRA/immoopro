import { supabase, handleSupabaseError } from '@/lib/supabase';

/**
 * Get all users
 */
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .order('last_name', { ascending: true });

    if (error) throw error;
    
    // Map to camelCase keys
    const users = data.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    }));
    
    return { users, error: null };
  } catch (error: any) {
    console.error('Error getting all users:', error);
    return { users: [], error: error.message };
  }
};

/**
 * Get all agencies
 */
export const getAllAgencies = async () => {
  try {
    const { data, error } = await supabase
      .from('agencies')
      .select('id, name, email, location')
      .order('name', { ascending: true });

    if (error) throw error;
    
    return { agencies: data, error: null };
  } catch (error: any) {
    console.error('Error getting all agencies:', error);
    return { agencies: [], error: error.message };
  }
};
