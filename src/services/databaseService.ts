
import { supabase } from '@/lib/supabase';

/**
 * Fetches the list of tables from the Supabase database
 */
export const listDatabaseTables = async () => {
  try {
    // Query to get all tables in the public schema
    const { data, error } = await supabase
      .from('_supabase_schema_migrations')
      .select('*');
    
    if (error) {
      console.error('Error fetching schema:', error);
      return { tables: [], error: error.message };
    }

    // Alternative approach using RPC if the above doesn't work
    const { data: tables, error: rpcError } = await supabase.rpc('get_tables');
    
    if (rpcError) {
      console.error('Error using RPC to fetch tables:', rpcError);
      // Fallback to listing known tables
      
      const knownTables = [
        'properties', 'agencies', 'profiles', 'administrators', 'tenants',
        'apartments', 'apartment_units', 'apartment_tenants', 'apartment_inspections'
      ];
      
      // Check each table with a simple count query to verify existence
      const tableChecks = await Promise.all(
        knownTables.map(async (table) => {
          const { count, error: countError } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          return {
            name: table,
            exists: !countError,
            error: countError ? countError.message : null,
            count
          };
        })
      );
      
      return { 
        tables: tableChecks.filter(t => t.exists).map(t => t.name),
        tableDetails: tableChecks,
        error: 'Used fallback method to check tables'
      };
    }
    
    return { tables: tables || [], error: null };
  } catch (error: any) {
    console.error('Unexpected error listing tables:', error);
    return { tables: [], error: error.message || 'Unknown error occurred' };
  }
};

/**
 * Gets the connection status to Supabase
 */
export const checkDatabaseConnection = async () => {
  try {
    // Simple query to check connection
    const { data, error } = await supabase.from('profiles').select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      return { 
        connected: false, 
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint,
          details: error.details
        }
      };
    }
    
    return { connected: true, error: null };
  } catch (error: any) {
    console.error('Connection error:', error);
    return { 
      connected: false, 
      error: error.message || 'Unknown error occurred',
      details: error
    };
  }
};

/**
 * Gets the current user's permissions
 */
export const checkUserPermissions = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      return { permissions: null, error: userError.message };
    }
    
    // Check if user has access to key tables
    const testTables = ['properties', 'profiles', 'agencies', 'tenants', 'apartments'];
    const tableAccess = await Promise.all(
      testTables.map(async (table) => {
        const { count, error: tableError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        return {
          table,
          hasAccess: !tableError,
          error: tableError ? tableError.message : null
        };
      })
    );
    
    return { 
      user: user ? { 
        id: user.id, 
        email: user.email,
        role: user.role
      } : null,
      tableAccess,
      error: null
    };
  } catch (error: any) {
    console.error('Error checking permissions:', error);
    return { permissions: null, error: error.message || 'Unknown error occurred' };
  }
};
