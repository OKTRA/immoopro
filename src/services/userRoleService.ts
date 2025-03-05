
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  created_by?: string;
}

export const userRoleService = {
  /**
   * Assign a role to a user
   */
  async assignRole(userId: string, role: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First, check if the user already has this role
      const { data: existingRoles, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', role);
      
      if (checkError) throw checkError;
      
      // If the user already has this role, return success
      if (existingRoles && existingRoles.length > 0) {
        return { success: true };
      }
      
      // Get current user to set as creator
      const { data: { user } } = await supabase.auth.getUser();
      
      // Insert the new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          created_by: user?.id
        });
      
      if (error) throw error;
      
      // Also update the profile's primary role for easier access
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      
      if (profileError) {
        console.warn('Updated role in user_roles but failed to update profiles:', profileError);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error assigning role:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Remove a role from a user
   */
  async removeRole(userId: string, role: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      
      if (error) throw error;
      
      // Find the most privileged remaining role to set as primary
      const { data: remainingRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (rolesError) throw rolesError;
      
      // Determine the new primary role (default to 'public' if no roles left)
      let newPrimaryRole = 'public';
      
      if (remainingRoles && remainingRoles.length > 0) {
        // Role hierarchy logic (most privileged first)
        const roleHierarchy = ['admin', 'agent', 'propriétaire', 'locataire', 'public'];
        
        // Find the highest role in the hierarchy that the user has
        for (const hierarchyRole of roleHierarchy) {
          if (remainingRoles.some(r => r.role === hierarchyRole)) {
            newPrimaryRole = hierarchyRole;
            break;
          }
        }
      }
      
      // Update profile with the new primary role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newPrimaryRole })
        .eq('id', userId);
      
      if (profileError) {
        console.warn('Removed role but failed to update profile:', profileError);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error removing role:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string): Promise<{ roles: string[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return { roles: data?.map(role => role.role) || [] };
    } catch (error: any) {
      console.error('Error fetching user roles:', error);
      return { roles: [], error: error.message };
    }
  },
  
  /**
   * Check if a user has a specific role
   */
  async hasRole(userId: string, role: string): Promise<{ hasRole: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('has_role', {
          _user_id: userId,
          _role: role
        });
      
      if (error) throw error;
      
      return { hasRole: !!data };
    } catch (error: any) {
      console.error('Error checking role:', error);
      return { hasRole: false, error: error.message };
    }
  }
};

/**
 * Hook to check if the current user has a specific role
 */
export const checkUserHasRole = async (requiredRole: string): Promise<boolean> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    // Check if user has the role
    const { hasRole, error } = await userRoleService.hasRole(user.id, requiredRole);
    
    if (error) {
      console.error('Error checking role:', error);
      return false;
    }
    
    return hasRole;
  } catch (error) {
    console.error('Error in checkUserHasRole:', error);
    return false;
  }
};
