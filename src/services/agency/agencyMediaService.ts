
import { supabase } from '@/lib/supabase';
import { updateAgency } from './agencyService';

/**
 * Upload agency logo
 */
export const uploadAgencyLogo = async (agencyId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${agencyId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `agencies/${fileName}`;
    
    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('agencies')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('agencies')
      .getPublicUrl(filePath);
    
    // Update the agency with the new logo URL
    const { agency, error: updateError } = await updateAgency(agencyId, {
      logoUrl: publicUrl
    });
    
    if (updateError) throw new Error(updateError);
    
    return { logoUrl: publicUrl, agency, error: null };
  } catch (error: any) {
    console.error('Error uploading agency logo:', error);
    return { logoUrl: null, agency: null, error: error.message };
  }
};
