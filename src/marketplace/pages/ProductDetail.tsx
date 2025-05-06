import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ShoppingCart,
  Store,
  Star,
  Truck,
  Package,
  ArrowLeft,
  Plus,
  Minus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getProductById } from "../services/productService";
import { Product } from "../types";
import { useMarketplace } from "../context/MarketplaceContext";
import ProductGrid from "../components/ProductGrid";
import { getProductsByShopId } from "../services/productService";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { addToCart, isInCart } = useMarketplace();

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;

      setLoading(true);
      try {
        const { product: fetchedProduct } = await getProductById(productId);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          setSelectedImage(
            fetchedProduct.images && fetchedProduct.images.length > 0
              ? fetchedProduct.images[0]
              : null,
          );

          // Fetch related products from the same shop
          if (fetchedProduct.shop_id) {
            setLoadingRelated(true);
            const { products: shopProducts } = await getProductsByShopId(
              fetchedProduct.shop_id,
              5,
            );
            // Filter out the current product
            const related = shopProducts.filter(
              (p) => p.id !== fetchedProduct.id,
            );
            setRelatedProducts(related);
            setLoadingRelated(false);
          }
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Impossible de charger les détails du produit");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success(`${product.name} ajouté au panier`);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 h-6 w-64 animate-pulse rounded bg-gray-200"></div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="h-96 animate-pulse rounded-lg bg-gray-200"></div>
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200"></div>
            <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200"></div>
            <div className="h-24 animate-pulse rounded bg-gray-200"></div>
            <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="h-12 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Package className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-bold">Produit non trouvé</h2>
            <p className="mb-6 text-center text-muted-foreground">
              Le produit que vous recherchez n'existe pas ou a été supprimé.
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

  const isOutOfStock =
    product.stock_quantity <= 0 || product.status === "out_of_stock";
  const isOnSale = product.sale_price && product.sale_price < product.price;
  const currentPrice = isOnSale ? product.sale_price! : product.price;

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/marketplace">
            Marketplace
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/marketplace/products">
            Produits
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink>{product.name}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Product details */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product images */}
        <div>
          <div className="mb-4 overflow-hidden rounded-lg border bg-white">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="h-96 w-full object-contain"
              />
            ) : (
              <div className="flex h-96 w-full items-center justify-center bg-gray-100">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Thumbnail gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border ${selectedImage === image ? "border-primary ring-2 ring-primary/20" : ""}`}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            {product.featured && <Badge className="bg-primary">Vedette</Badge>}
            {isOnSale && <Badge className="bg-red-500">Promo</Badge>}
            <Badge variant="outline" className="bg-muted/50">
              {product.category_id}
            </Badge>
          </div>

          <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>

          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center">
              <Star className="mr-1 h-4 w-4 text-yellow-500" />
              <span>{product.rating || "N/A"}</span>
              {product.total_reviews && (
                <span className="ml-1 text-sm text-muted-foreground">
                  ({product.total_reviews} avis)
                </span>
              )}
            </div>

            <Link
              to={`/marketplace/shops/${product.shop_id}`}
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <Store className="mr-1 h-4 w-4" />
              {product.shop_name || "Boutique"}
            </Link>
          </div>

          <div className="mb-6">
            {isOnSale ? (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-red-600">
                  {formatCurrency(product.sale_price!, product.currency)}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  {formatCurrency(product.price, product.currency)}
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold">
                {formatCurrency(product.price, product.currency)}
              </span>
            )}
          </div>

          <div className="mb-6">
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span className="font-medium">Disponibilité:</span>
              {isOutOfStock ? (
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  Rupture de stock
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800"
                >
                  En stock ({product.stock_quantity} disponibles)
                </Badge>
              )}
            </div>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-r-none"
                onClick={decrementQuantity}
                disabled={quantity <= 1 || isOutOfStock}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-l-none"
                onClick={incrementQuantity}
                disabled={isOutOfStock || quantity >= product.stock_quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isInCart(product.id) ? "Ajouter encore" : "Ajouter au panier"}
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span>Livraison disponible</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product details tabs */}
      <div className="mt-12">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="specifications">Spécifications</TabsTrigger>
            <TabsTrigger value="reviews">Avis</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-medium">
                  Description du produit
                </h3>
                <p className="whitespace-pre-line">{product.description}</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="specifications" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-medium">Spécifications</h3>
                {product.specifications &&
                Object.keys(product.specifications).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <div key={key} className="grid grid-cols-3 gap-4">
                          <div className="font-medium">{key}</div>
                          <div className="col-span-2">{value}</div>
                          <Separator className="col-span-3" />
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Aucune spécification disponible
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-medium">Avis clients</h3>
                <p className="text-muted-foreground">
                  Aucun avis pour le moment
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Produits similaires</h2>
          <ProductGrid
            products={relatedProducts}
            loading={loadingRelated}
            emptyMessage="Aucun produit similaire trouvé"
          />
        </div>
      )}
    </div>
  );
}
