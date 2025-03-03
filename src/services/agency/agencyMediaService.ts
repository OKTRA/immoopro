
import { supabase } from '@/lib/supabase';

/**
 * Upload agency logo
 */
export const uploadAgencyLogo = async (agencyId: string, file: File) => {
  try {
    // Create unique filename with timestamp to prevent conflicts
    const fileExt = file.name.split('.').pop();
    const fileName = `${agencyId}-logo-${Date.now()}.${fileExt}`;
    const filePath = `agency-logos/${fileName}`;
    
    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('agency-assets')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('agency-assets')
      .getPublicUrl(filePath);
    
    // Update the agency record with the new logo URL
    const { error: updateError } = await supabase
      .from('agencies')
      .update({ logo_url: publicUrl })
      .eq('id', agencyId);
    
    if (updateError) throw updateError;
    
    return { logoUrl: publicUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading agency logo:', error);
    return { logoUrl: null, error: error.message };
  }
};
