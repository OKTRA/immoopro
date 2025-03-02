
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const createUserProfile = async (userId: string, profileData: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...profileData
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { profile: data, error: null };
  } catch (error: any) {
    console.error('Error creating user profile:', error);
    toast({
      description: 'Échec de création du profil utilisateur',
      variant: 'destructive'
    });
    return { profile: null, error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return { profile: data, error: null };
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return { profile: null, error };
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      description: 'Profil mis à jour avec succès',
      variant: 'default'
    });
    
    return { profile: data, error: null };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    toast({
      description: 'Échec de mise à jour du profil utilisateur',
      variant: 'destructive'
    });
    return { profile: null, error };
  }
};
