
import { supabase } from '@/lib/supabase';
import { createUserProfile, getProfileByUserId } from './profileService';
import { toast } from 'sonner';

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching current user:', error);
    return { user: null, error };
  }
  return { user: data.user, error: null };
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Error signing in:', error);
    return { user: null, error: error.message };
  }
};

// Alias for Auth.tsx
export const signIn = signInWithEmail;

export const signUpWithEmail = async (
  email: string, 
  password: string, 
  userData?: {
    firstName?: string;
    lastName?: string;
    role?: string;
  }
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData?.firstName,
          last_name: userData?.lastName,
          role: userData?.role || 'public',
        },
      }
    });

    if (error) throw error;

    // Create user profile in profiles table
    if (data.user) {
      await createUserProfile(data.user.id, {
        first_name: userData?.firstName,
        last_name: userData?.lastName,
        role: userData?.role || 'public',
        email: email,
      });
    }

    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Error signing up:', error);
    return { user: null, error: error.message };
  }
};

// Alias for Auth.tsx
export const signUp = signUpWithEmail;

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    toast('Déconnexion réussie');
    return { error: null };
  } catch (error: any) {
    console.error('Error signing out:', error);
    toast(`Erreur lors de la déconnexion: ${error.message}`);
    return { error: error.message };
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    
    toast('Instructions envoyées', {
      description: 'Vérifiez votre email pour réinitialiser votre mot de passe',
    });
    
    return { error: null };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    toast(`Erreur: ${error.message}`);
    return { error: error.message };
  }
};

export const updatePassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) throw error;
    
    toast('Mot de passe mis à jour avec succès');
    
    return { error: null };
  } catch (error: any) {
    console.error('Error updating password:', error);
    toast(`Erreur: ${error.message}`);
    return { error: error.message };
  }
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error fetching session:', error);
    return { session: null, error };
  }
  return { session: data.session, error: null };
};
