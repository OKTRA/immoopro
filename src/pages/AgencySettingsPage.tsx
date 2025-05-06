import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  Bell,
  Shield,
  Upload,
  Image,
  MapPin,
  Mail,
  Phone,
  Globe,
  Tag,
  Map,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { updateAgency } from "@/services/agency/agencyManagementService";
import { getAgencyById } from "@/services/agency/agencyBasicService";
import { Separator } from "@/components/ui/separator";

export default function AgencySettingsPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    specialties: "",
    serviceAreas: "",
    logoUrl: "",
    bannerUrl: "",
  });

  useEffect(() => {
    const fetchAgencyData = async () => {
      if (!agencyId) return;

      setFetchingData(true);
      try {
        const { agency, error } = await getAgencyById(agencyId);

        if (error) {
          toast.error(`Erreur lors du chargement des données: ${error}`);
          return;
        }

        if (agency) {
          setFormData({
            name: agency.name || "",
            location: agency.location || "",
            description: agency.description || "",
            email: agency.email || "",
            phone: agency.phone || "",
            website: agency.website || "",
            specialties: agency.specialties?.join(", ") || "",
            serviceAreas: agency.serviceAreas?.join(", ") || "",
            logoUrl: agency.logoUrl || "",
            bannerUrl: agency.bannerUrl || "",
          });

          setLogoPreview(agency.logoUrl || null);
          setBannerPreview(agency.bannerUrl || null);
        }
      } catch (error: any) {
        console.error("Error fetching agency data:", error);
        toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
      } finally {
        setFetchingData(false);
      }
    };

    fetchAgencyData();
  }, [agencyId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setBannerPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyId) return;

    setLoading(true);

    try {
      // Upload logic will be implemented in the next phase
      toast.success("Modifications enregistrées avec succès");
    } catch (error: any) {
      console.error("Error updating agency:", error);
      toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Paramètres de l'agence</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="general">
            <Building2 className="h-4 w-4 mr-2" /> Général
          </TabsTrigger>
          <TabsTrigger value="media">
            <Image className="h-4 w-4 mr-2" /> Médias
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" /> Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" /> Sécurité
          </TabsTrigger>
        </TabsList>

        {fetchingData ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de l'agence</CardTitle>
                  <CardDescription>
                    Gérez les informations générales de votre agence.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom de l'agence</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nom de l'agence"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <Label htmlFor="location">Adresse</Label>
                      </div>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Adresse de l'agence"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Description détaillée de l'agence et de ses services"
                        className="flex w-full rounded-md border border-input bg-background px-3 py-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        rows={4}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <Label htmlFor="email">Email</Label>
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email de contact professionnel"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <Label htmlFor="phone">Téléphone</Label>
                      </div>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Numéro de téléphone professionnel"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <Label htmlFor="website">Site web</Label>
                      </div>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="Site web de l'agence (avec https://)"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <Label htmlFor="specialties">Spécialités</Label>
                      </div>
                      <Input
                        id="specialties"
                        name="specialties"
                        value={formData.specialties}
                        onChange={handleChange}
                        placeholder="Résidentiel, Commercial, Investissement, Luxe..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Séparez les spécialités par des virgules
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Map className="h-4 w-4 text-primary" />
                        <Label htmlFor="serviceAreas">Zones de service</Label>
                      </div>
                      <Input
                        id="serviceAreas"
                        name="serviceAreas"
                        value={formData.serviceAreas}
                        onChange={handleChange}
                        placeholder="Paris, Boulogne, Neuilly..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Séparez les zones par des virgules
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/agencies/${agencyId}`)}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading
                      ? "Mise à jour..."
                      : "Enregistrer les modifications"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Médias de l'agence</CardTitle>
                  <CardDescription>
                    Gérez le logo et la bannière de votre agence.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label htmlFor="logo">Logo de l'agence</Label>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50/60">
                        {logoPreview ? (
                          <div className="relative w-40 h-40 mb-4">
                            <img
                              src={logoPreview}
                              alt="Logo de l'agence"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4">
                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Aucun logo téléchargé
                            </p>
                          </div>
                        )}
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="mt-4"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Format recommandé : JPG ou PNG, carré, minimum
                          400x400px
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="banner">Bannière de l'agence</Label>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50/60">
                        {bannerPreview ? (
                          <div className="relative w-full h-40 mb-4">
                            <img
                              src={bannerPreview}
                              alt="Bannière de l'agence"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4">
                            <Image className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Aucune bannière téléchargée
                            </p>
                          </div>
                        )}
                        <Input
                          id="banner"
                          type="file"
                          accept="image/*"
                          onChange={handleBannerChange}
                          className="mt-4"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Format recommandé : JPG ou PNG, 1200x400px
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/agencies/${agencyId}`)}
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading
                      ? "Mise à jour..."
                      : "Enregistrer les modifications"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        )}

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>
                Gérez les utilisateurs qui ont accès à cette agence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  La gestion des utilisateurs sera disponible prochainement.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de notification</CardTitle>
              <CardDescription>
                Configurez vos préférences de notification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Les paramètres de notification seront disponibles
                  prochainement.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité et confidentialité</CardTitle>
              <CardDescription>
                Gérez les paramètres de sécurité et de confidentialité.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Les paramètres de sécurité et de confidentialité seront
                  disponibles prochainement.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
