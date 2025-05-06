import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Store, Upload } from "lucide-react";
import { createShopPersistent, updateShop } from "../services/shopService";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/services/authService";

export default function CreateShopPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    contact_email: "",
    contact_phone: "",
  });

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
    setLoading(true);

    try {
      // Get current user
      const { user } = await getCurrentUser();
      if (!user) {
        toast.error("Vous devez être connecté pour créer une boutique");
        navigate("/auth?redirectTo=/marketplace/shops/create");
        return;
      }

      // Create shop in database
      const { shop, error } = await createShopPersistent({
        ...formData,
        owner_id: user.id,
        status: "active",
      });

      if (error || !shop) {
        console.error("Shop creation failed with error:", error);
        throw new Error(error || "Erreur lors de la création de la boutique");
      }

      // Use placeholder images or uploaded previews
      let logo_url =
        logoPreview ||
        "https://api.dicebear.com/7.x/avataaars/svg?seed=" + shop.id;
      let banner_url =
        bannerPreview ||
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80";

      // Update shop with image URLs
      const { shop: updatedShop, error: updateError } = await updateShop(
        shop.id,
        {
          logo_url: logo_url,
          banner_url: banner_url,
        },
      );

      if (updateError) {
        console.error("Error updating shop with images:", updateError);
        // Continue anyway, the shop was created successfully
      }

      toast.success("Boutique créée avec succès!");
      navigate(`/marketplace/shops/${shop.id}`);
    } catch (error: any) {
      console.error("Error creating shop:", error);
      toast.error(
        `Erreur lors de la création de la boutique: ${error.message || "Une erreur est survenue"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/marketplace")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Créer une nouvelle boutique</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informations de la boutique</CardTitle>
            <CardDescription>
              Remplissez les informations pour créer votre boutique sur le
              marketplace
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la boutique *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nom de votre boutique"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Emplacement</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Emplacement de votre boutique"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Email de contact *</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  placeholder="Email de contact"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Téléphone de contact</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="Téléphone de contact"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description de votre boutique"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo de la boutique</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Store className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Recommandé: 200x200px, JPG ou PNG
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner">Bannière de la boutique</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-32 overflow-hidden rounded-md border bg-muted">
                    {bannerPreview ? (
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="banner"
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Recommandé: 1200x400px, JPG ou PNG
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/marketplace")}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création en cours..." : "Créer la boutique"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
