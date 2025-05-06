import { Link } from "react-router-dom";
import { Product } from "../types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useMarketplace } from "../context/MarketplaceContext";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart, isInCart } = useMarketplace();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const isOutOfStock =
    product.stock_quantity <= 0 || product.status === "out_of_stock";
  const isOnSale = product.sale_price && product.sale_price < product.price;

  return (
    <Link to={`/marketplace/products/${product.id}`}>
      <Card
        className={`overflow-hidden transition-all hover:shadow-md ${className}`}
      >
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <span className="text-sm text-gray-400">Aucune image</span>
            </div>
          )}
          {product.featured && (
            <Badge className="absolute left-2 top-2 bg-primary">Vedette</Badge>
          )}
          {isOnSale && (
            <Badge className="absolute right-2 top-2 bg-red-500">Promo</Badge>
          )}
        </div>

        <CardContent className="p-4">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="line-clamp-1 font-medium">{product.name}</h3>
            <div className="flex items-center">
              <Star className="mr-1 h-3 w-3 text-yellow-500" />
              <span className="text-xs">{product.rating || "N/A"}</span>
            </div>
          </div>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {product.description}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t bg-muted/20 p-4">
          <div>
            {isOnSale ? (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground line-through">
                  {formatCurrency(product.price, product.currency)}
                </span>
                <span className="font-medium text-red-600">
                  {formatCurrency(product.sale_price!, product.currency)}
                </span>
              </div>
            ) : (
              <span className="font-medium">
                {formatCurrency(product.price, product.currency)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant={isInCart(product.id) ? "outline" : "default"}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            {isInCart(product.id) ? "Ajouté" : "Ajouter"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
