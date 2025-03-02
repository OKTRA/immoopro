
import { supabase } from '@/lib/supabase';

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error signing in:', error);
    return { data: null, error: error.message };
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error signing up:', error);
    return { data: null, error: error.message };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error signing out:', error);
    return { error: error.message };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Error getting current user:', error);
    return { user: null, error: error.message };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return { profile: data, error: null };
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return { profile: null, error: error.message };
  }
};

export const testDatabaseAccess = async () => {
  try {
    // Test accessing multiple tables to check permissions
    const testTables = [
      'profiles',
      'properties',
      'agencies',
      'administrators',
      'tenants',
      'apartments'
    ];
    
    const results = await Promise.all(
      testTables.map(async (table) => {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        return {
          table,
          accessible: !error,
          count: count || 0,
          error: error ? error.message : null
        };
      })
    );
    
    return { results, error: null };
  } catch (error: any) {
    console.error('Error testing database access:', error);
    return { results: [], error: error.message };
  }
};
