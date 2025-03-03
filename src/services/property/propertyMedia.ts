
import { supabase } from '@/lib/supabase';

// Function to upload a property image
export const uploadPropertyImage = async (propertyId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}-${Date.now()}.${fileExt}`;
    const filePath = `properties/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('properties')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('properties')
      .getPublicUrl(filePath);
    
    return { imageUrl: publicUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading property image:', error);
    return { imageUrl: '', error: error.message };
  }
};
