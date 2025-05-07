import { useState } from "react";
import { toast } from "sonner";
import {
  uploadAgencyLogo,
  uploadAgencyBanner,
  uploadAgencyMedia,
  uploadExpenseMedia,
  deleteMedia,
} from "@/services/media/mediaService";

interface UseMediaUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
  showToasts?: boolean;
}

export const useMediaUpload = (options: UseMediaUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { onSuccess, onError, showToasts = true } = options;

  // Simulate upload progress (since Supabase doesn't provide progress events)
  const simulateProgress = (callback: (url: string) => void) => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    return (url: string) => {
      clearInterval(interval);
      setProgress(100);
      callback(url);
    };
  };

  const handleUploadSuccess = (url: string) => {
    setIsUploading(false);
    setError(null);
    if (showToasts) {
      toast.success("Fichier téléchargé avec succès");
    }
    if (onSuccess) {
      onSuccess(url);
    }
  };

  const handleUploadError = (errorMessage: string) => {
    setIsUploading(false);
    setError(errorMessage);
    if (showToasts) {
      toast.error(`Erreur lors du téléchargement: ${errorMessage}`);
    }
    if (onError) {
      onError(errorMessage);
    }
  };

  const uploadLogo = async (agencyId: string, file: File) => {
    setIsUploading(true);
    setError(null);

    const completeUpload = simulateProgress(handleUploadSuccess);

    try {
      const { url, error } = await uploadAgencyLogo(agencyId, file);
      if (error) throw new Error(error);
      if (url) {
        completeUpload(url);
        return url;
      } else {
        throw new Error("URL de téléchargement non disponible");
      }
    } catch (err: any) {
      handleUploadError(err.message);
      return null;
    }
  };

  const uploadBanner = async (agencyId: string, file: File) => {
    setIsUploading(true);
    setError(null);

    const completeUpload = simulateProgress(handleUploadSuccess);

    try {
      const { url, error } = await uploadAgencyBanner(agencyId, file);
      if (error) throw new Error(error);
      if (url) {
        completeUpload(url);
        return url;
      } else {
        throw new Error("URL de téléchargement non disponible");
      }
    } catch (err: any) {
      handleUploadError(err.message);
      return null;
    }
  };

  const uploadAgencyFile = async (
    agencyId: string,
    file: File,
    category?: string,
  ) => {
    setIsUploading(true);
    setError(null);

    const completeUpload = simulateProgress(handleUploadSuccess);

    try {
      const { url, error } = await uploadAgencyMedia(agencyId, file, category);
      if (error) throw new Error(error);
      if (url) {
        completeUpload(url);
        return url;
      } else {
        throw new Error("URL de téléchargement non disponible");
      }
    } catch (err: any) {
      handleUploadError(err.message);
      return null;
    }
  };

  const uploadExpenseFile = async (
    expenseId: string,
    file: File,
    type?: string,
  ) => {
    setIsUploading(true);
    setError(null);

    const completeUpload = simulateProgress(handleUploadSuccess);

    try {
      const { url, error } = await uploadExpenseMedia(expenseId, file, type);
      if (error) throw new Error(error);
      if (url) {
        completeUpload(url);
        return url;
      } else {
        throw new Error("URL de téléchargement non disponible");
      }
    } catch (err: any) {
      handleUploadError(err.message);
      return null;
    }
  };

  const removeFile = async (bucketName: string, filePath: string) => {
    try {
      const { success, error } = await deleteMedia(bucketName, filePath);
      if (error) throw new Error(error);
      if (success && showToasts) {
        toast.success("Fichier supprimé avec succès");
      }
      return success;
    } catch (err: any) {
      if (showToasts) {
        toast.error(`Erreur lors de la suppression: ${err.message}`);
      }
      return false;
    }
  };

  return {
    isUploading,
    progress,
    error,
    uploadLogo,
    uploadBanner,
    uploadAgencyFile,
    uploadExpenseFile,
    removeFile,
  };
};
