
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { getProfileByUserId } from './profileService';

// Get the currently logged in user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error: any) {
    console.error('Error getting current user:', error);
    return { user: null, error };
  }
};

// Get the user's profile
export const getUserProfile = async (userId: string) => {
  return getProfileByUserId(userId);
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    toast({
      title: 'Connexion réussie',
      description: 'Bienvenue sur notre plateforme'
    });
    
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Error signing in:', error);
    toast({
      title: 'Échec de connexion',
      description: error.message || 'Vérifiez vos identifiants'
    });
    return { user: null, error };
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string, role: string = 'public') => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role
        }
      }
    });
    
    if (error) throw error;
    
    toast({
      title: 'Inscription réussie',
      description: 'Vous êtes maintenant inscrit sur notre plateforme'
    });
    
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Error signing up:', error);
    toast({
      title: 'Échec d\'inscription',
      description: error.message || 'Vérifiez vos informations'
    });
    return { user: null, error };
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    toast({
      title: 'Déconnexion réussie',
      description: 'À bientôt !'
    });
    
    return { error: null };
  } catch (error: any) {
    console.error('Error signing out:', error);
    toast({
      title: 'Échec de déconnexion',
      description: error.message || 'Une erreur est survenue'
    });
    return { error };
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    
    toast({
      title: 'Email envoyé',
      description: 'Vérifiez votre boîte de réception pour réinitialiser votre mot de passe'
    });
    
    return { error: null };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    toast({
      title: 'Échec d\'envoi',
      description: error.message || 'Vérifiez votre email'
    });
    return { error };
  }
};

// Update password
export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    toast({
      title: 'Mot de passe mis à jour',
      description: 'Votre mot de passe a été modifié avec succès'
    });
    
    return { error: null };
  } catch (error: any) {
    console.error('Error updating password:', error);
    toast({
      title: 'Échec de mise à jour',
      description: error.message || 'Une erreur est survenue'
    });
    return { error };
  }
};
