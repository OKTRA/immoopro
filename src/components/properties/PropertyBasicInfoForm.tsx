import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Property } from "@/assets/types";
import { Home, MapPin, Building, Bath, Coffee, ShoppingBag, Sofa, Square } from "lucide-react";

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
    kitchens: initialData.kitchens?.toString() || "0",
    shops: initialData.shops?.toString() || "0",
    livingRooms: initialData.livingRooms?.toString() || "0",
    area: initialData.area?.toString() || "0",
  });

  const isInitialRender = useRef(true);
  const lastUpdateRef = useRef<Partial<Property>>({});

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const updatedData = {
      title: formData.title,
      location: formData.location,
      description: formData.description,
      type: formData.type,
      propertyCategory: formData.propertyCategory as "residence" | "apartment" | "commercial" | "land" | "other",
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      kitchens: parseInt(formData.kitchens) || 0,
      shops: parseInt(formData.shops) || 0,
      livingRooms: parseInt(formData.livingRooms) || 0,
      area: parseFloat(formData.area) || 0,
    };

    const hasChanged = Object.keys(updatedData).some(
      key => updatedData[key as keyof typeof updatedData] !== lastUpdateRef.current[key as keyof typeof updatedData]
    );

    if (hasChanged) {
      lastUpdateRef.current = updatedData;
      onUpdate(updatedData);
    }
  }, [formData, onUpdate]);

  useEffect(() => {
    if (
      initialData.title !== undefined && initialData.title !== formData.title ||
      initialData.location !== undefined && initialData.location !== formData.location ||
      initialData.description !== undefined && initialData.description !== formData.description ||
      initialData.type !== undefined && initialData.type !== formData.type ||
      initialData.propertyCategory !== undefined && initialData.propertyCategory !== formData.propertyCategory
    ) {
      setFormData(prev => ({
        ...prev,
        title: initialData.title || prev.title,
        location: initialData.location || prev.location,
        description: initialData.description || prev.description,
        type: initialData.type || prev.type,
        propertyCategory: initialData.propertyCategory || prev.propertyCategory,
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name: string, value: string) => {
    if (value === "" || /^\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="group relative space-y-2 transition-all focus-within:scale-[1.01]">
          <Label htmlFor="title" className="inline-flex items-center text-base font-medium">
            <Home className="mr-2 h-4 w-4 text-muted-foreground" />
            Titre de la propriété
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="Entrez le titre de la propriété"
            value={formData.title}
            onChange={handleChange}
            className="border-muted bg-background/50 text-lg shadow-sm transition-all focus:border-primary"
            required
          />
        </div>

        <div className="group relative space-y-2 transition-all focus-within:scale-[1.01]">
          <Label htmlFor="location" className="inline-flex items-center text-base font-medium">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            Adresse / Localisation
          </Label>
          <Input
            id="location"
            name="location"
            placeholder="Adresse complète"
            value={formData.location}
            onChange={handleChange}
            className="border-muted bg-background/50 text-lg shadow-sm transition-all focus:border-primary"
            required
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background/50 p-5 shadow-sm">
        <h3 className="mb-4 text-base font-medium text-foreground">Type de propriété</h3>
        <div className="grid grid-cols-3 gap-4">
          <div 
            className={`cursor-pointer rounded-lg border p-4 text-center transition-all hover:border-primary hover:bg-primary/5 ${formData.type === 'apartment' ? 'border-primary bg-primary/10' : 'border-muted'}`}
            onClick={() => handleSelectChange("type", "apartment")}
          >
            <Building className="mx-auto mb-2 h-6 w-6 text-primary" />
            <span>Appartement</span>
          </div>
          <div 
            className={`cursor-pointer rounded-lg border p-4 text-center transition-all hover:border-primary hover:bg-primary/5 ${formData.type === 'house' ? 'border-primary bg-primary/10' : 'border-muted'}`}
            onClick={() => handleSelectChange("type", "house")}
          >
            <Home className="mx-auto mb-2 h-6 w-6 text-primary" />
            <span>Maison</span>
          </div>
          <div 
            className={`cursor-pointer rounded-lg border p-4 text-center transition-all hover:border-primary hover:bg-primary/5 ${formData.type === 'villa' ? 'border-primary bg-primary/10' : 'border-muted'}`}
            onClick={() => handleSelectChange("type", "villa")}
          >
            <Home className="mx-auto mb-2 h-6 w-6 text-primary" />
            <span>Villa</span>
          </div>
          <div 
            className={`cursor-pointer rounded-lg border p-4 text-center transition-all hover:border-primary hover:bg-primary/5 ${formData.type === 'office' ? 'border-primary bg-primary/10' : 'border-muted'}`}
            onClick={() => handleSelectChange("type", "office")}
          >
            <Building className="mx-auto mb-2 h-6 w-6 text-primary" />
            <span>Bureau</span>
          </div>
          <div 
            className={`cursor-pointer rounded-lg border p-4 text-center transition-all hover:border-primary hover:bg-primary/5 ${formData.type === 'commercial' ? 'border-primary bg-primary/10' : 'border-muted'}`}
            onClick={() => handleSelectChange("type", "commercial")}
          >
            <ShoppingBag className="mx-auto mb-2 h-6 w-6 text-primary" />
            <span>Commercial</span>
          </div>
          <div 
            className={`cursor-pointer rounded-lg border p-4 text-center transition-all hover:border-primary hover:bg-primary/5 ${formData.type === 'land' ? 'border-primary bg-primary/10' : 'border-muted'}`}
            onClick={() => handleSelectChange("type", "land")}
          >
            <Square className="mx-auto mb-2 h-6 w-6 text-primary" />
            <span>Terrain</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background/50 p-5 shadow-sm">
        <h3 className="mb-4 text-base font-medium text-foreground">Caractéristiques</h3>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="bedrooms" className="inline-flex items-center">
              <Home className="mr-2 h-4 w-4 text-muted-foreground" />
              Chambres
            </Label>
            <div className="flex rounded-md border">
              <button 
                type="button" 
                className="flex h-10 w-10 items-center justify-center rounded-l-md border-r bg-muted/50 text-lg font-medium"
                onClick={() => {
                  const currentValue = parseInt(formData.bedrooms) || 0;
                  if (currentValue > 0) {
                    handleNumberChange("bedrooms", String(currentValue - 1));
                  }
                }}
              >
                -
              </button>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="text"
                className="h-10 flex-1 rounded-none border-0 text-center"
                value={formData.bedrooms}
                onChange={(e) => handleNumberChange("bedrooms", e.target.value)}
              />
              <button 
                type="button" 
                className="flex h-10 w-10 items-center justify-center rounded-r-md border-l bg-muted/50 text-lg font-medium"
                onClick={() => {
                  const currentValue = parseInt(formData.bedrooms) || 0;
                  handleNumberChange("bedrooms", String(currentValue + 1));
                }}
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="livingRooms" className="inline-flex items-center">
              <Sofa className="mr-2 h-4 w-4 text-muted-foreground" />
              Salons
            </Label>
            <div className="flex rounded-md border">
              <button 
                type="button" 
                className="flex h-10 w-10 items-center justify-center rounded-l-md border-r bg-muted/50 text-lg font-medium"
                onClick={() => {
                  const currentValue = parseInt(formData.livingRooms) || 0;
                  if (currentValue > 0) {
                    handleNumberChange("livingRooms", String(currentValue - 1));
                  }
                }}
              >
                -
              </button>
              <Input
                id="livingRooms"
                name="livingRooms"
                type="text"
                className="h-10 flex-1 rounded-none border-0 text-center"
                value={formData.livingRooms}
                onChange={(e) => handleNumberChange("livingRooms", e.target.value)}
              />
              <button 
                type="button" 
                className="flex h-10 w-10 items-center justify-center rounded-r-md border-l bg-muted/50 text-lg font-medium"
                onClick={() => {
                  const currentValue = parseInt(formData.livingRooms) || 0;
                  handleNumberChange("livingRooms", String(currentValue + 1));
                }}
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bathrooms" className="inline-flex items-center">
              <Bath className="mr-2 h-4 w-4 text-muted-foreground" />
              Salles de bain
            </Label>
            <div className="flex rounded-md border">
              <button 
                type="button" 
                className="flex h-10 w-10 items-center justify-center rounded-l-md border-r bg-muted/50 text-lg font-medium"
                onClick={() => {
                  const currentValue = parseInt(formData.bathrooms) || 0;
                  if (currentValue > 0) {
                    handleNumberChange("bathrooms", String(currentValue - 1));
                  }
                }}
              >
                -
              </button>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="text"
                className="h-10 flex-1 rounded-none border-0 text-center"
                value={formData.bathrooms}
                onChange={(e) => handleNumberChange("bathrooms", e.target.value)}
              />
              <button 
                type="button" 
                className="flex h-10 w-10 items-center justify-center rounded-r-md border-l bg-muted/50 text-lg font-medium"
                onClick={() => {
                  const currentValue = parseInt(formData.bathrooms) || 0;
                  handleNumberChange("bathrooms", String(currentValue + 1));
                }}
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kitchens" className="inline-flex items-center">
              <Coffee className="mr-2 h-4 w-4 text-muted-foreground" />
              Cuisines
            </Label>
            <div className="flex rounded-md border">
              <button 
                type="button" 
                className="flex h-10 w-10 items-center justify-center rounded-l-md border-r bg-muted/50 text-lg font-medium"
                onClick={() => {
                  const currentValue = parseInt(formData.kitchens) || 0;
                  if (currentValue > 0) {
                    handleNumberChange("kitchens", String(currentValue - 1));
                  }
                }}
              >
                -
              </button>
              <Input
                id="kitchens"
                name="kitchens"
                type="text"
                className="h-10 flex-1 rounded-none border-0 text-center"
                value={formData.kitchens}
                onChange={(e) => handleNumberChange("kitchens", e.target.value)}
              />
              <button 
                type="button" 
                className="flex h-10 w-10 items-center justify-center rounded-r-md border-l bg-muted/50 text-lg font-medium"
                onClick={() => {
                  const currentValue = parseInt(formData.kitchens) || 0;
                  handleNumberChange("kitchens", String(currentValue + 1));
                }}
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shops" className="inline-flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
              Magasins
            </Label>
            <div className="flex rounded-md border">
              <button 
                type="button" 
                className="flex h-10 w-10 items-center justify-center rounded-l-md border-r bg-muted/50 text-lg font-medium"
                onClick={() => {
                  const currentValue = parseInt(formData.shops) || 0;
                  if (currentValue > 0) {
                    handleNumberChange("shops", String(currentValue - 1));
                  }
                }}
              >
                -
              </button>
              <Input
                id="shops"
                name="shops"
                type="text"
                className="h-10 flex-1 rounded-none border-0 text-center"
                value={formData.shops}
                onChange={(e) => handleNumberChange("shops", e.target.value)}
              />
              <button 
                type="button" 
                className="flex h-10 w-10 items-center justify-center rounded-r-md border-l bg-muted/50 text-lg font-medium"
                onClick={() => {
                  const currentValue = parseInt(formData.shops) || 0;
                  handleNumberChange("shops", String(currentValue + 1));
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="group relative space-y-2 transition-all focus-within:scale-[1.01]">
        <Label htmlFor="area" className="inline-flex items-center text-base font-medium">
          <Square className="mr-2 h-4 w-4 text-muted-foreground" />
          Surface (m²)
        </Label>
        <Input
          id="area"
          name="area"
          type="number"
          min="0"
          placeholder="Surface en m²"
          value={formData.area}
          onChange={handleChange}
          className="border-muted bg-background/50 text-lg shadow-sm transition-all focus:border-primary"
        />
      </div>

      <div className="group relative space-y-2 transition-all focus-within:scale-[1.01]">
        <Label htmlFor="description" className="text-base font-medium">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Description détaillée de la propriété"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="min-h-[120px] border-muted bg-background/50 text-base shadow-sm transition-all focus:border-primary"
        />
      </div>
    </div>
  );
}
