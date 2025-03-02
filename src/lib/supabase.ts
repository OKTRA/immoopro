
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

// Helper for data transformation from snake_case to camelCase
export const transformSnakeToCamel = <T extends Record<string, any>>(obj: T): any => {
  if (!obj) return obj;
  
  const transformed: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    transformed[camelKey] = obj[key];
  });
  
  return transformed;
};

// Helper for transforming arrays of objects
export const transformArraySnakeToCamel = <T extends Record<string, any>>(array: T[]): any[] => {
  if (!array) return [];
  return array.map(item => transformSnakeToCamel(item));
};

// Helper for data transformation from camelCase to snake_case
export const transformCamelToSnake = <T extends Record<string, any>>(obj: T): any => {
  if (!obj) return obj;
  
  const transformed: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    transformed[snakeKey] = obj[key];
  });
  
  return transformed;
};
