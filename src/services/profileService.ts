
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
    toast('Échec de création du profil utilisateur', {
      description: error.message
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
    
    toast('Profil mis à jour avec succès', {
      description: 'Vos informations ont été mises à jour'
    });
    
    return { profile: data, error: null };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    toast('Échec de mise à jour du profil utilisateur', {
      description: error.message
    });
    return { profile: null, error };
  }
};

// Add uploadProfileAvatar function for Profile.tsx
export const uploadProfileAvatar = async (userId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with avatar URL
    const avatarUrl = data.publicUrl;
    const { profile, error: updateError } = await updateUserProfile(userId, { avatar_url: avatarUrl });

    if (updateError) throw updateError;

    toast('Avatar mis à jour avec succès', {
      description: 'Votre photo de profil a été mise à jour'
    });

    return { avatarUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    toast('Échec du téléchargement de l\'avatar', {
      description: error.message
    });
    return { avatarUrl: null, error };
  }
};

// Add getProfileByUserId for authService.ts
export const getProfileByUserId = async (userId: string) => {
  return getUserProfile(userId);
};
