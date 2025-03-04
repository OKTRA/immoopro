
import { supabase } from '@/lib/supabase';

// Get the current user
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error("Error getting current user:", error.message);
    return { user: null, error: error.message };
  }
};

// Get user profile by ID
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return { profile: data, error: null };
  } catch (error: any) {
    console.error("Error getting user profile:", error.message);
    return { profile: null, error: error.message };
  }
};

// Check if user has specific role
export const checkUserRole = async (userId: string, requiredRole: string) => {
  try {
    const { profile, error } = await getUserProfile(userId);
    
    if (error) {
      throw new Error(error);
    }
    
    if (!profile) {
      return { hasRole: false, error: null };
    }
    
    return { 
      hasRole: profile.role === requiredRole,
      userRole: profile.role,
      error: null 
    };
  } catch (error: any) {
    console.error("Error checking user role:", error.message);
    return { hasRole: false, userRole: null, error: error.message };
  }
};

// Sign out the current user
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error: any) {
    console.error("Error signing out:", error.message);
    return { error: error.message };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error("Error signing in:", error.message);
    return { user: null, error: error.message };
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, userData: any = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) {
      throw error;
    }
    
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error("Error signing up:", error.message);
    return { user: null, error: error.message };
  }
};
