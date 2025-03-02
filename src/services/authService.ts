
import { supabase } from '@/lib/supabase';
import { createUserProfile, getProfileByUserId } from './profileService';

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

export const signUp = async (
  email: string, 
  password: string, 
  userData?: {
    firstName?: string;
    lastName?: string;
    role?: 'admin' | 'agency' | 'owner' | 'public';
  }
) => {
  try {
    // Register user with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    
    if (signUpError) throw signUpError;
    
    // Create user profile after successful registration
    if (authData.user) {
      const { profile, error: profileError } = await createUserProfile(
        authData.user.id,
        email,
        userData?.firstName,
        userData?.lastName,
        userData?.role || 'public'
      );
      
      if (profileError) {
        console.error('Error creating profile after sign up:', profileError);
      }
    }
    
    return { data: authData, error: null };
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
  return getProfileByUserId(userId);
};

export const resetPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return { data: null, error: error.message };
  }
};

export const changePassword = async (newPassword: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error changing password:', error);
    return { data: null, error: error.message };
  }
};

export const updateUserEmail = async (newEmail: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error updating email:', error);
    return { data: null, error: error.message };
  }
};

export const verifyOtp = async (
  email: string,
  token: string,
  type: 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change'
) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return { data: null, error: error.message };
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

export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return { session: data.session, error: null };
  } catch (error: any) {
    console.error('Error refreshing session:', error);
    return { session: null, error: error.message };
  }
};
