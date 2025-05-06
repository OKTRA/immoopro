import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ShoppingBag, Store, Package } from "lucide-react";
import CategoryFilter from "../components/CategoryFilter";
import ProductGrid from "../components/ProductGrid";
import ShopCard from "../components/ShopCard";
import CartWidget from "../components/CartWidget";
import { getShops } from "../services/shopService";
import { getProducts, getFeaturedProducts } from "../services/productService";
import { Shop, Product } from "../types";

export default function MarketplaceHome() {
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);

  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingShops, setLoadingShops] = useState(true);

  // Initialize marketplace data
  useEffect(() => {
    // No need to check database tables - they will be created automatically when needed
  }, []);

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoadingFeatured(true);
      try {
        const { products } = await getFeaturedProducts(8);
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Fetch products based on filters
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoadingProducts(true);
      try {
        const filters: any = {};

        if (searchQuery) {
          filters.search = searchQuery;
        }

        if (selectedCategoryId) {
          filters.category_id = selectedCategoryId;
        }

        const { products: fetchedProducts } = await getProducts(12, 0, filters);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchFilteredProducts();
  }, [searchQuery, selectedCategoryId]);

  // Fetch shops
  useEffect(() => {
    const fetchShops = async () => {
      setLoadingShops(true);
      try {
        const filters: any = {};

        if (searchQuery) {
          filters.search = searchQuery;
        }

        if (selectedCategoryId) {
          filters.category_id = selectedCategoryId;
        }

        const { shops: fetchedShops } = await getShops(8, 0, filters);
        setShops(fetchedShops);
      } catch (error) {
        console.error("Error fetching shops:", error);
      } finally {
        setLoadingShops(false);
      }
    };

    if (activeTab === "shops") {
      fetchShops();
    }
  }, [activeTab, searchQuery, selectedCategoryId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect dependencies
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">
            Découvrez des produits et services pour votre immobilier
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CartWidget />
        </div>
      </div>

      {/* Search and filters */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des produits ou boutiques..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit">Rechercher</Button>
          </form>
        </CardContent>
      </Card>

      {/* Category filter */}
      <CategoryFilter
        onSelectCategory={setSelectedCategoryId}
        selectedCategoryId={selectedCategoryId}
      />

      {/* Featured products */}
      {!searchQuery && !selectedCategoryId && (
        <div className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Produits en vedette</h2>
            <Button variant="link" asChild>
              <Link to="/marketplace/products">Voir tout</Link>
            </Button>
          </div>
          <ProductGrid
            products={featuredProducts}
            loading={loadingFeatured}
            emptyMessage="Aucun produit en vedette pour le moment"
          />
        </div>
      )}

      {/* Tabs for Products and Shops */}
      <Tabs
        defaultValue="products"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-8"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="products">
            <Package className="mr-2 h-4 w-4" />
            Produits
          </TabsTrigger>
          <TabsTrigger value="shops">
            <Store className="mr-2 h-4 w-4" />
            Boutiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-0">
          <ProductGrid
            products={products}
            loading={loadingProducts}
            emptyMessage={
              searchQuery
                ? "Aucun produit trouvé pour votre recherche"
                : "Aucun produit disponible"
            }
          />
        </TabsContent>

        <TabsContent value="shops" className="mt-0">
          {loadingShops ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="h-32 w-full bg-gray-200" />
                  <CardContent className="p-4">
                    <div className="mb-4 h-4 w-3/4 bg-gray-200" />
                    <div className="h-3 w-full bg-gray-200" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : shops.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border bg-muted/20">
              <div className="text-center">
                <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Aucune boutique trouvée pour votre recherche"
                    : "Aucune boutique disponible"}
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
