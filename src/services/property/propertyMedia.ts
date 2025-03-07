
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Fonction pour télécharger une image de propriété
export const uploadPropertyImage = async (propertyId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}-${Date.now()}.${fileExt}`;
    const filePath = `${propertyId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('properties')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('properties')
      .getPublicUrl(filePath);
    
    return { imageUrl: publicUrl, error: null, filePath };
  } catch (error: any) {
    console.error('Error uploading property image:', error);
    return { imageUrl: '', error: error.message, filePath: '' };
  }
};

// Fonction pour récupérer toutes les images d'une propriété
export const getPropertyImages = async (propertyId: string) => {
  try {
    const { data, error } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId)
      .order('is_primary', { ascending: false })
      .order('position', { ascending: true });
      
    if (error) throw error;
    
    return { images: data || [], error: null };
  } catch (error: any) {
    console.error('Error fetching property images:', error);
    return { images: [], error: error.message };
  }
};

// Fonction pour définir une image comme principale
export const setPropertyMainImage = async (propertyId: string, imageUrl: string) => {
  try {
    // Mise à jour de l'URL de l'image principale dans la table properties
    const { error } = await supabase
      .from('properties')
      .update({ image_url: imageUrl })
      .eq('id', propertyId);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error setting main property image:', error);
    return { success: false, error: error.message };
  }
};

// Fonction pour associer des images téléchargées temporairement à une propriété après création
export const associateTempImagesToProperty = async (propertyId: string, images: Array<{url: string, isPrimary: boolean, description: string}>) => {
  try {
    if (!images || images.length === 0) return { success: true, error: null };
    
    const entries = images.map(img => ({
      property_id: propertyId,
      image_url: img.url,
      is_primary: img.isPrimary,
      description: img.description || null
    }));
    
    const { error } = await supabase
      .from('property_images')
      .insert(entries);
      
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error associating images to property:', error);
    return { success: false, error: error.message };
  }
};

// Fonction pour supprimer toutes les images d'une propriété
export const deleteAllPropertyImages = async (propertyId: string) => {
  try {
    // Supprimer les entrées de la base de données
    const { error: dbError } = await supabase
      .from('property_images')
      .delete()
      .eq('property_id', propertyId);
      
    if (dbError) throw dbError;
    
    // Supprimer tous les fichiers du bucket pour cette propriété
    const { data: filesList, error: listError } = await supabase.storage
      .from('properties')
      .list(propertyId);
      
    if (listError) throw listError;
    
    if (filesList && filesList.length > 0) {
      const filesToRemove = filesList.map(file => `${propertyId}/${file.name}`);
      
      const { error: removeError } = await supabase.storage
        .from('properties')
        .remove(filesToRemove);
        
      if (removeError) throw removeError;
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting property images:', error);
    return { success: false, error: error.message };
  }
};
