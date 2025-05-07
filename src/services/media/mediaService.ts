import { supabase } from "@/lib/supabase";

/**
 * Upload a file to a specific Supabase storage bucket
 * @param bucketName The name of the bucket to upload to
 * @param filePath The path where the file will be stored in the bucket
 * @param file The file to upload
 * @param contentType Optional content type of the file
 * @returns Object containing the file URL or error
 */
export const uploadMedia = async (
  bucketName: string,
  filePath: string,
  file: File,
  contentType?: string,
) => {
  try {
    // Check if the file is valid
    if (!file) {
      throw new Error("No file provided");
    }

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: contentType || file.type,
        upsert: true, // Overwrite if file exists
      });

    if (error) {
      console.error(`Error uploading file to ${bucketName}:`, error);
      throw error;
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (error: any) {
    console.error("Upload media error:", error);
    return { url: null, error: error.message || "Failed to upload media" };
  }
};

/**
 * Delete a file from a Supabase storage bucket
 * @param bucketName The name of the bucket
 * @param filePath The path of the file to delete
 * @returns Success status and error if any
 */
export const deleteMedia = async (bucketName: string, filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error(`Error deleting file from ${bucketName}:`, error);
      throw error;
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error("Delete media error:", error);
    return { success: false, error: error.message || "Failed to delete media" };
  }
};

/**
 * Get a list of files from a specific path in a bucket
 * @param bucketName The name of the bucket
 * @param folderPath The folder path to list files from
 * @returns List of files or error
 */
export const listMedia = async (
  bucketName: string,
  folderPath: string = "",
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath);

    if (error) {
      console.error(
        `Error listing files in ${bucketName}/${folderPath}:`,
        error,
      );
      throw error;
    }

    return { files: data, error: null };
  } catch (error: any) {
    console.error("List media error:", error);
    return { files: [], error: error.message || "Failed to list media" };
  }
};

/**
 * Generate a unique file path for uploading
 * @param folder The folder within the bucket
 * @param fileName Original file name
 * @returns A unique file path
 */
export const generateUniqueFilePath = (
  folder: string,
  fileName: string,
): string => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 10);
  const extension = fileName.split(".").pop();

  return `${folder}/${timestamp}-${randomString}.${extension}`;
};

/**
 * Upload agency logo
 * @param agencyId The ID of the agency
 * @param file The logo file to upload
 * @returns Object containing the logo URL or error
 */
export const uploadAgencyLogo = async (agencyId: string, file: File) => {
  const filePath = generateUniqueFilePath(`agency-${agencyId}`, file.name);
  return uploadMedia("agency-logos", filePath, file);
};

/**
 * Upload agency banner
 * @param agencyId The ID of the agency
 * @param file The banner file to upload
 * @returns Object containing the banner URL or error
 */
export const uploadAgencyBanner = async (agencyId: string, file: File) => {
  const filePath = generateUniqueFilePath(`agency-${agencyId}`, file.name);
  return uploadMedia("agency-banners", filePath, file);
};

/**
 * Upload agency media (general media files)
 * @param agencyId The ID of the agency
 * @param file The media file to upload
 * @param category Optional category for organizing media
 * @returns Object containing the media URL or error
 */
export const uploadAgencyMedia = async (
  agencyId: string,
  file: File,
  category: string = "general",
) => {
  const filePath = generateUniqueFilePath(
    `agency-${agencyId}/${category}`,
    file.name,
  );
  return uploadMedia("agency-media", filePath, file);
};

/**
 * Upload expense media (receipts, invoices, etc.)
 * @param expenseId The ID of the expense
 * @param file The expense document file to upload
 * @param type Optional type of expense document
 * @returns Object containing the document URL or error
 */
export const uploadExpenseMedia = async (
  expenseId: string,
  file: File,
  type: string = "receipt",
) => {
  const filePath = generateUniqueFilePath(
    `expense-${expenseId}/${type}`,
    file.name,
  );
  return uploadMedia("expense-media", filePath, file);
};
