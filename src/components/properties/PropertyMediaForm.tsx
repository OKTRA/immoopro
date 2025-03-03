
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Property } from "@/assets/types";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { uploadPropertyImage } from "@/services/propertyService";

interface PropertyMediaFormProps {
  initialData: Partial<Property>;
  onChange: (data: Partial<Property>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function PropertyMediaForm({ initialData, onChange, onNext, onBack }: PropertyMediaFormProps) {
  const [formData, setFormData] = useState({
    imageUrl: initialData.imageUrl || "",
    virtualTourUrl: initialData.virtualTourUrl || "",
    tempImageFile: null as File | null,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    onChange({
      imageUrl: formData.imageUrl,
      virtualTourUrl: formData.virtualTourUrl,
    });
  }, [formData.imageUrl, formData.virtualTourUrl, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, tempImageFile: file }));
      
      // Create a preview
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageUrl }));
    }
  };

  const handleUpload = async () => {
    if (!formData.tempImageFile) {
      toast.error("Veuillez sélectionner une image à télécharger");
      return;
    }

    setUploading(true);
    try {
      // For now, we'll just use a placeholder ID since we haven't created the property yet
      const tempId = "temp-" + Date.now();
      const { imageUrl, error } = await uploadPropertyImage(tempId, formData.tempImageFile);
      
      if (error) throw new Error(error);
      
      setFormData(prev => ({ ...prev, imageUrl, tempImageFile: null }));
      toast.success("Image téléchargée avec succès");
    } catch (error: any) {
      toast.error(`Erreur lors du téléchargement: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: "", tempImageFile: null }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="image">Image principale</Label>
        <div className="flex items-center gap-4">
          <Input
            id="image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex-1">
            {formData.imageUrl ? (
              <div className="relative h-40 w-full border rounded-md overflow-hidden">
                <img 
                  src={formData.imageUrl} 
                  alt="Aperçu de la propriété" 
                  className="h-full w-full object-cover"
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label 
                htmlFor="image"
                className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
              >
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Cliquez pour sélectionner une image
                </p>
              </label>
            )}
          </div>
          {formData.tempImageFile && (
            <Button 
              onClick={handleUpload} 
              disabled={uploading}
              variant="secondary"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Chargement..." : "Télécharger"}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          L'image principale sera affichée comme aperçu de la propriété. Format recommandé: JPEG ou PNG, max 5MB.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="virtualTourUrl">URL de visite virtuelle (optionnel)</Label>
        <Input
          id="virtualTourUrl"
          name="virtualTourUrl"
          type="url"
          placeholder="https://exemple.com/visite-virtuelle"
          value={formData.virtualTourUrl}
          onChange={handleChange}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Ajoutez un lien vers une visite virtuelle (Matterport, YouTube 360, etc.)
        </p>
      </div>

      {(onNext || onBack) && (
        <div className="flex justify-between pt-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Retour
            </Button>
          )}
          {onNext && (
            <Button type="button" onClick={onNext} className="ml-auto">
              Suivant
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
