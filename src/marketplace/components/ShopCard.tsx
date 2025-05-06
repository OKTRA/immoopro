import { Link } from "react-router-dom";
import { Shop } from "../types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Package } from "lucide-react";

interface ShopCardProps {
  shop: Shop;
  className?: string;
}

export default function ShopCard({ shop, className }: ShopCardProps) {
  return (
    <Link to={`/marketplace/shops/${shop.id}`}>
      <Card
        className={`overflow-hidden transition-all hover:shadow-md ${className}`}
      >
        <div className="relative h-32 w-full overflow-hidden bg-gray-100">
          {shop.banner_url ? (
            <img
              src={shop.banner_url}
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
            <div className="absolute -bottom-8 left-4 h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-white">
              {shop.logo_url ? (
                <img
                  src={shop.logo_url}
                  alt={`${shop.name} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xl font-bold text-primary">
                  {shop.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        <CardContent className="pt-10">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">{shop.name}</h3>
            <Badge variant="outline" className="bg-primary/5">
              {shop.status === "active" ? "Actif" : "Inactif"}
            </Badge>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {shop.description || "Aucune description disponible"}
          </p>
        </CardContent>

        <CardFooter className="border-t bg-muted/20 px-4 py-2">
          <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="mr-1 h-3 w-3" />
              <span>{shop.location || "Emplacement non spécifié"}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Star className="mr-1 h-3 w-3 text-yellow-500" />
                <span>{shop.rating || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <Package className="mr-1 h-3 w-3" />
                <span>{shop.total_products || 0} produits</span>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
