
import { useState } from "react";
import { createAgency, uploadAgencyLogo } from "@/services/agencyService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonEffects } from "@/components/ui/ButtonEffects";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Agency } from "@/assets/types";
import { MapPin, Mail, Phone, Globe, Tag, Map } from "lucide-react";

export default function CreateAgencyForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    specialties: "",
    serviceAreas: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert string specialties and serviceAreas to arrays
      const specialtiesArray = formData.specialties.split(',').map(item => item.trim()).filter(Boolean);
      const serviceAreasArray = formData.serviceAreas.split(',').map(item => item.trim()).filter(Boolean);

      // Create agency without logo first
      const placeholderLogoUrl = "https://placehold.co/400x400?text=Agency";
      
      const agencyData: Omit<Agency, 'id'> = {
        name: formData.name,
        logoUrl: placeholderLogoUrl,
        location: formData.location,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        specialties: specialtiesArray,
        serviceAreas: serviceAreasArray,
        properties: 0,
        rating: 0,
        verified: false
      };

      // Create the agency
      const { agency, error } = await createAgency(agencyData);

      if (error || !agency) {
        throw new Error(error || "Échec de la création de l'agence");
      }

      // If we have a logo file, upload it now that we have the agency ID
      if (logoFile && agency.id) {
        const { logoUrl, error: logoError } = await uploadAgencyLogo(agency.id, logoFile);
        
        if (logoError) {
          console.error("Erreur lors du téléchargement du logo, mais l'agence a été créée", logoError);
          toast.warning("Agence créée, mais le logo n'a pas pu être téléchargé");
        } else {
          toast.success("Agence créée avec succès avec logo");
        }
      } else {
        toast.success("Agence créée avec succès");
      }

      // Redirect to agency page or list
      navigate(`/agencies`);
    } catch (error: any) {
      console.error("Erreur lors de la création de l'agence:", error);
      toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-6">Créer une nouvelle agence</h2>
        <p className="text-muted-foreground mb-8">
          Remplissez ce formulaire pour ajouter une nouvelle agence immobilière
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations générales */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-medium">Informations générales</h3>
          
          <div>
            <Label htmlFor="name">Nom de l'agence *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nom de l'agence"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description de l'agence et de ses services"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-1"
              rows={4}
            />
          </div>
        </div>

        {/* Logo de l'agence */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-medium">Logo de l'agence</h3>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-24 h-24 border rounded-lg overflow-hidden flex items-center justify-center bg-muted">
              {logoPreview ? (
                <img src={logoPreview} alt="Aperçu du logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm text-muted-foreground">Aucun logo</span>
              )}
            </div>
            
            <div className="flex-grow space-y-2">
              <Label htmlFor="logo">Télécharger un logo</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground">
                Format recommandé : JPG ou PNG, carré, minimum 400x400px
              </p>
            </div>
          </div>
        </div>

        {/* Emplacement et Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Emplacement et Contact</h3>
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="location">Adresse *</Label>
          </div>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Adresse de l'agence"
            required
            className="mt-1"
          />

          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="email">Email</Label>
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email de contact"
            className="mt-1"
          />

          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="phone">Téléphone</Label>
          </div>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Numéro de téléphone"
            className="mt-1"
          />

          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="website">Site web</Label>
          </div>
          <Input
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="Site web de l'agence"
            className="mt-1"
          />
        </div>

        {/* Spécialités et zones de service */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Spécialités et zones de service</h3>
          
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="specialties">Spécialités</Label>
          </div>
          <Input
            id="specialties"
            name="specialties"
            value={formData.specialties}
            onChange={handleChange}
            placeholder="Appartements, Maisons, Commercial (séparés par des virgules)"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground">
            Séparez les spécialités par des virgules (ex: Appartements, Maisons, Commercial)
          </p>

          <div className="flex items-center space-x-2">
            <Map className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="serviceAreas">Zones de service</Label>
          </div>
          <Input
            id="serviceAreas"
            name="serviceAreas"
            value={formData.serviceAreas}
            onChange={handleChange}
            placeholder="Paris, Boulogne, Neuilly (séparés par des virgules)"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground">
            Séparez les zones par des virgules (ex: Paris, Boulogne, Neuilly)
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <ButtonEffects
          type="button"
          variant="outline"
          onClick={() => navigate('/agencies')}
          disabled={isSubmitting}
        >
          Annuler
        </ButtonEffects>
        <ButtonEffects
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting ? 'Création en cours...' : 'Créer l\'agence'}
        </ButtonEffects>
      </div>
    </form>
  );
}
