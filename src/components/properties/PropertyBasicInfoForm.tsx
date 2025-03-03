
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property } from "@/assets/types";

interface PropertyBasicInfoFormProps {
  initialData: Partial<Property>;
  onUpdate: (data: Partial<Property>) => void;
}

export default function PropertyBasicInfoForm({ initialData, onUpdate }: PropertyBasicInfoFormProps) {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    location: initialData.location || "",
    description: initialData.description || "",
    type: initialData.type || "",
    propertyCategory: initialData.propertyCategory || "residence",
    bedrooms: initialData.bedrooms?.toString() || "0",
    bathrooms: initialData.bathrooms?.toString() || "0",
    area: initialData.area?.toString() || "0",
  });

  useEffect(() => {
    // Convert string values to appropriate types and update parent
    onUpdate({
      title: formData.title,
      location: formData.location,
      description: formData.description,
      type: formData.type,
      propertyCategory: formData.propertyCategory as "residence" | "apartment" | "commercial" | "land" | "other",
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      area: parseFloat(formData.area) || 0,
    });
  }, [formData, onUpdate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titre de la propriété</Label>
        <Input
          id="title"
          name="title"
          placeholder="Entrez le titre de la propriété"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Adresse / Localisation</Label>
        <Input
          id="location"
          name="location"
          placeholder="Adresse complète"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type de propriété</Label>
          <Select name="type" value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Appartement</SelectItem>
              <SelectItem value="house">Maison</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="office">Bureau</SelectItem>
              <SelectItem value="commercial">Local commercial</SelectItem>
              <SelectItem value="land">Terrain</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyCategory">Catégorie</Label>
          <Select name="propertyCategory" value={formData.propertyCategory} onValueChange={(value) => handleSelectChange("propertyCategory", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residence">Résidentiel</SelectItem>
              <SelectItem value="apartment">Appartement</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="land">Terrain</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Chambres</Label>
          <Input
            id="bedrooms"
            name="bedrooms"
            type="number"
            min="0"
            placeholder="Nombre de chambres"
            value={formData.bedrooms}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">Salles de bain</Label>
          <Input
            id="bathrooms"
            name="bathrooms"
            type="number"
            min="0"
            step="0.5"
            placeholder="Nombre de SDB"
            value={formData.bathrooms}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">Surface (m²)</Label>
          <Input
            id="area"
            name="area"
            type="number"
            min="0"
            placeholder="Surface en m²"
            value={formData.area}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Description détaillée de la propriété"
          rows={4}
          value={formData.description}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
