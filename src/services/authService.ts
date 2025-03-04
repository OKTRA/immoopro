
import { supabase } from '@/lib/supabase';
import { createUserProfile, getProfileByUserId } from './profileService';
import { toast } from 'sonner';

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching current user:', error);
      return { user: null, error };
    }
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Unexpected error in getCurrentUser:', error);
    return { user: null, error };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('Attempting to sign in with email:', email);
    
    // Vérification des champs
    if (!email || !password) {
      return { 
        user: null, 
        error: 'Veuillez remplir tous les champs' 
      };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error in signInWithEmail:', error);
      let errorMessage = 'Email ou mot de passe incorrect';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
      } else {
        errorMessage = `Erreur: ${error.message}`;
      }
      
      toast.error(errorMessage);
      return { user: null, error: errorMessage };
    }

    console.log('Sign in successful for:', email);
    toast.success('Connexion réussie');
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Unexpected error signing in:', error);
    const errorMessage = error.message || 'Problème de connexion';
    toast.error(errorMessage);
    return { user: null, error: errorMessage };
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
    console.log('Attempting to sign up with email:', email, 'and role:', userData?.role);
    
    // Vérification des champs
    if (!email || !password) {
      return { 
        user: null, 
        error: 'Veuillez remplir tous les champs' 
      };
    }
    
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

    if (error) {
      console.error('Error in signUpWithEmail:', error);
      let userMessage = 'Erreur lors de l\'inscription';
      
      if (error.message.includes('already registered')) {
        userMessage = 'Cet email est déjà utilisé';
      } else if (error.message.includes('password')) {
        userMessage = 'Le mot de passe ne respecte pas les critères de sécurité';
      } else {
        userMessage = `Erreur: ${error.message}`;
      }
      
      toast.error(userMessage);
      return { user: null, error: userMessage };
    }

    // Create user profile in profiles table
    if (data.user) {
      await createUserProfile(data.user.id, {
        first_name: userData?.firstName,
        last_name: userData?.lastName,
        role: userData?.role || 'public',
        email: email,
      });
    }

    console.log('Sign up successful for:', email);
    
    toast.success('Inscription réussie', {
      description: 'Veuillez vérifier votre email pour confirmer votre compte'
    });
    
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Unexpected error signing up:', error);
    const userMessage = `Erreur: ${error.message}`;
    toast.error(userMessage);
    return { user: null, error: userMessage };
  }
};

// Alias for Auth.tsx
export const signUp = signUpWithEmail;

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      toast.error(`Erreur lors de la déconnexion: ${error.message}`);
      return { error: error.message };
    }
    
    toast.success('Déconnexion réussie');
    return { error: null };
  } catch (error: any) {
    console.error('Unexpected error signing out:', error);
    toast.error(`Erreur lors de la déconnexion: ${error.message}`);
    return { error: error.message };
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Error resetting password:', error);
      toast.error(`Erreur: ${error.message}`);
      return { error: error.message };
    }
    
    toast.success('Instructions envoyées', {
      description: 'Vérifiez votre email pour réinitialiser votre mot de passe',
    });
    
    return { error: null };
  } catch (error: any) {
    console.error('Unexpected error resetting password:', error);
    toast.error(`Erreur: ${error.message}`);
    return { error: error.message };
  }
};

export const updatePassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) {
      console.error('Error updating password:', error);
      toast.error(`Erreur: ${error.message}`);
      return { error: error.message };
    }
    
    toast.success('Mot de passe mis à jour avec succès');
    
    return { error: null };
  } catch (error: any) {
    console.error('Unexpected error updating password:', error);
    toast.error(`Erreur: ${error.message}`);
    return { error: error.message };
  }
};

export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching session:', error);
      return { session: null, error };
    }
    return { session: data.session, error: null };
  } catch (error: any) {
    console.error('Unexpected error fetching session:', error);
    return { session: null, error };
  }
};
