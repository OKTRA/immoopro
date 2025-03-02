
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

/**
 * Creates a new user profile after registration
 */
export const createUserProfile = async (
  userId: string, 
  email: string, 
  firstName?: string,
  lastName?: string,
  role: 'admin' | 'agency' | 'owner' | 'public' = 'public'
) => {
  try {
    const profileData = {
      user_id: userId,
      email,
      first_name: firstName || '',
      last_name: lastName || '',
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();
    
    if (error) throw error;
    return { profile: data, error: null };
  } catch (error: any) {
    console.error('Error creating user profile:', error);
    return { profile: null, error: error.message };
  }
};

/**
 * Gets a user profile by user ID
 */
export const getProfileByUserId = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return { profile: data, error: null };
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return { profile: null, error: error.message };
  }
};

/**
 * Updates a user profile
 */
export const updateProfile = async (userId: string, profileData: any) => {
  try {
    // Remove user_id from profileData if present (can't update primary key)
    const { user_id, ...updateData } = profileData;
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { profile: data, error: null };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { profile: null, error: error.message };
  }
};

/**
 * Get all profiles with optional filtering
 */
export const getAllProfiles = async (
  role?: 'admin' | 'agency' | 'owner' | 'public',
  limit = 100,
  offset = 0
) => {
  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .range(offset, offset + limit - 1);
    
    if (role) {
      query = query.eq('role', role);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    return { profiles: data, count, error: null };
  } catch (error: any) {
    console.error('Error getting profiles:', error);
    return { profiles: [], count: 0, error: error.message };
  }
};

/**
 * Uploads a profile avatar and updates the profile with the new avatar URL
 */
export const uploadProfileAvatar = async (userId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);
    
    // Update the user's profile with the new avatar URL
    const { profile, error: updateError } = await updateProfile(userId, {
      avatar_url: publicUrl
    });
    
    if (updateError) throw new Error(updateError);
    
    return { avatar: publicUrl, profile, error: null };
  } catch (error: any) {
    console.error('Error uploading profile avatar:', error);
    return { avatar: null, profile: null, error: error.message };
  }
};
