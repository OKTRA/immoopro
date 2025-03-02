
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Use environment variables or fallback to these values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://apidxwaaogboeoctlhtz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verify that we have the required values
if (!supabaseUrl) {
  console.error('Missing Supabase URL');
}

if (!supabaseAnonKey) {
  console.error('Missing Supabase Anon Key - Please set VITE_SUPABASE_ANON_KEY environment variable');
  console.warn('Using mock data for development');
  // For development, you could use mock data here
}

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey || '' // Provide empty string as fallback to prevent runtime errors
);

// Helper function to handle Supabase errors
export const handleSupabaseError = <T>(error: any): { data: T | null; error: string } => {
  console.error('Supabase error:', error);
  return { data: null, error: error.message || 'An unknown error occurred' };
};

// Helper for checking if Supabase connection is valid
export const isSupabaseConnected = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('agencies').select('id').limit(1);
    return !error;
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    return false;
  }
};

