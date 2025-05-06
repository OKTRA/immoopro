import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Store,
  Package,
  ShoppingBag,
  Settings,
  Plus,
  Upload,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { getShopById, updateShop } from "../services/shopService";
import { getProductsByShopId, deleteProduct } from "../services/productService";
import { Shop, Product } from "../types";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

export default function ShopDashboard() {
  const { shopId } = useParams<{ shopId: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [shopForm, setShopForm] = useState<Partial<Shop>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopDetails = async () => {
      if (!shopId) return;

      setLoading(true);
      try {
        const { shop: fetchedShop } = await getShopById(shopId);
        if (fetchedShop) {
          setShop(fetchedShop);
          setShopForm({
            name: fetchedShop.name,
            description: fetchedShop.description,
            location: fetchedShop.location,
            contact_email: fetchedShop.contact_email,
            contact_phone: fetchedShop.contact_phone,
          });
          setLogoPreview(fetchedShop.logo_url || null);
          setBannerPreview(fetchedShop.banner_url || null);

          // Fetch shop products
          setLoadingProducts(true);
          const { products: shopProducts } = await getProductsByShopId(shopId);
          setProducts(shopProducts);
          setLoadingProducts(false);
        }
      } catch (error) {
        console.error("Error fetching shop details:", error);
        toast.error("Impossible de charger les détails de la boutique");
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [shopId]);

  const handleShopFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setShopForm((prev) => ({ ...prev, [name]: value }));
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

  const handleSaveShop = async () => {
    if (!shopId || !shop) return;

    try {
      // Upload logo if changed
      let logo_url = shop.logo_url;
      if (logoFile) {
        const logoFileName = `${Date.now()}-${logoFile.name}`;
        const { error: logoUploadError, data: logoData } =
          await supabase.storage
            .from("marketplace")
            .upload(`shops/${shopId}/logo/${logoFileName}`, logoFile);

        if (logoUploadError) throw logoUploadError;

        const { data: logoPublicUrl } = supabase.storage
          .from("marketplace")
          .getPublicUrl(`shops/${shopId}/logo/${logoFileName}`);

        logo_url = logoPublicUrl.publicUrl;
      }

      // Upload banner if changed
      let banner_url = shop.banner_url;
      if (bannerFile) {
        const bannerFileName = `${Date.now()}-${bannerFile.name}`;
        const { error: bannerUploadError, data: bannerData } =
          await supabase.storage
            .from("marketplace")
            .upload(`shops/${shopId}/banner/${bannerFileName}`, bannerFile);

        if (bannerUploadError) throw bannerUploadError;

        const { data: bannerPublicUrl } = supabase.storage
          .from("marketplace")
          .getPublicUrl(`shops/${shopId}/banner/${bannerFileName}`);

        banner_url = bannerPublicUrl.publicUrl;
      }

      // Update shop details
      const { shop: updatedShop, error } = await updateShop(shopId, {
        ...shopForm,
        logo_url,
        banner_url,
      });

      if (error) throw new Error(error);

      if (updatedShop) {
        setShop(updatedShop);
        toast.success("Boutique mise à jour avec succès");
        setEditMode(false);
      }
    } catch (error: any) {
      console.error("Error updating shop:", error);
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;

    try {
      const { success, error } = await deleteProduct(productId);
      if (error) throw new Error(error);

      if (success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        toast.success("Produit supprimé avec succès");
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 h-6 w-64 animate-pulse rounded bg-gray-200"></div>
        <div className="h-40 animate-pulse rounded-lg bg-gray-200"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Store className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-bold">Boutique non trouvée</h2>
            <p className="mb-6 text-center text-muted-foreground">
              La boutique que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <Button asChild>
              <Link to="/marketplace">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au marketplace
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/marketplace">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Tableau de bord de la boutique</h1>
        </div>
        <Button
          variant={editMode ? "outline" : "default"}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? (
            "Annuler"
          ) : (
            <>
              <Settings className="mr-2 h-4 w-4" /> Modifier la boutique
            </>
          )}
        </Button>
      </div>

      {/* Shop header */}
      <div className="mb-8 overflow-hidden rounded-lg border bg-card">
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          {bannerPreview ? (
            <img
              src={bannerPreview}
              alt={`${shop.name} banner`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <span className="text-lg font-medium text-gray-400">
                {shop.name}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="absolute -bottom-16 left-8 h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt={`${shop.name} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
                  {shop.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{shop.name}</h2>
              <p className="text-muted-foreground">{shop.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm text-muted-foreground">Produits</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{shop.rating || "N/A"}</p>
                <p className="text-sm text-muted-foreground">Note</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editMode ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Modifier les informations de la boutique</CardTitle>
            <CardDescription>
              Mettez à jour les détails de votre boutique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la boutique</Label>
                <Input
                  id="name"
                  name="name"
                  value={shopForm.name || ""}
                  onChange={handleShopFormChange}
                  placeholder="Nom de votre boutique"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Emplacement</Label>
                <Input
                  id="location"
                  name="location"
                  value={shopForm.location || ""}
                  onChange={handleShopFormChange}
                  placeholder="Emplacement de votre boutique"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Email de contact</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={shopForm.contact_email || ""}
                  onChange={handleShopFormChange}
                  placeholder="Email de contact"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Téléphone de contact</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  value={shopForm.contact_phone || ""}
                  onChange={handleShopFormChange}
                  placeholder="Téléphone de contact"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={shopForm.description || ""}
                  onChange={handleShopFormChange}
                  placeholder="Description de votre boutique"
                  rows={4}
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
                      Recommandé: 1200x300px, JPG ou PNG
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveShop}>
              Enregistrer les modifications
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="products">
            <Package className="mr-2 h-4 w-4" /> Produits
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="mr-2 h-4 w-4" /> Commandes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Produits de la boutique</h2>
            <Button asChild>
              <Link to={`/marketplace/shops/${shopId}/products/create`}>
                <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
              </Link>
            </Button>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-40 animate-pulse bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Package className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold">Aucun produit</h3>
                <p className="mb-6 text-center text-muted-foreground">
                  Vous n'avez pas encore ajouté de produits à votre boutique.
                </p>
                <Button asChild>
                  <Link to={`/marketplace/shops/${shopId}/products/create`}>
                    <Plus className="mr-2 h-4 w-4" /> Ajouter votre premier
                    produit
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative h-48 w-full overflow-hidden bg-muted">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold">{product.name}</h3>
                      <span className="font-medium text-primary">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link
                          to={`/marketplace/shops/${shopId}/products/${product.id}/edit`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">
                Gestion des commandes
              </h3>
              <p className="mb-6 text-center text-muted-foreground">
                Cette fonctionnalité sera disponible prochainement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
