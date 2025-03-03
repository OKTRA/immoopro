
import { Property } from "@/assets/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Home, MapPin, Ruler, Hotel, Bath, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";

interface PropertyListProps {
  properties: Property[];
  agencyId?: string;
}

export default function PropertyList({ properties, agencyId }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune propriété trouvée</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card key={property.id} className="overflow-hidden flex flex-col h-full">
          <div className="relative h-48 overflow-hidden">
            {property.imageUrl ? (
              <img 
                src={property.imageUrl} 
                alt={property.title} 
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Home className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <Badge 
              className="absolute top-2 right-2" 
              variant={
                property.status === "available" ? "default" :
                property.status === "sold" ? "destructive" :
                "secondary"
              }
            >
              {property.status === "available" ? "Disponible" :
               property.status === "sold" ? "Vendu" :
               property.status === "pending" ? "En attente" :
               property.status}
            </Badge>
          </div>
          
          <CardContent className="flex flex-col flex-grow p-4">
            <div className="mb-2 flex justify-between items-start">
              <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
              <span className="font-bold text-primary">
                {formatCurrency(property.price, "EUR")}
              </span>
            </div>
            
            <div className="flex items-center text-muted-foreground text-sm mb-3">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span className="truncate">{property.location}</span>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-4 text-sm">
              <div className="flex items-center" title="Surface">
                <Ruler className="h-3.5 w-3.5 mr-1" />
                <span>{property.area} m²</span>
              </div>
              
              {property.bedrooms > 0 && (
                <div className="flex items-center" title="Chambres">
                  <Hotel className="h-3.5 w-3.5 mr-1" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              
              {property.bathrooms > 0 && (
                <div className="flex items-center" title="Salles de bain">
                  <Bath className="h-3.5 w-3.5 mr-1" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              
              {property.type && (
                <div className="flex items-center" title="Type">
                  <Tag className="h-3.5 w-3.5 mr-1" />
                  <span>{property.type}</span>
                </div>
              )}
            </div>
            
            <div className="mt-auto flex gap-2">
              <Link 
                to={`/agencies/${agencyId}/properties/${property.id}`}
                className="flex-1"
              >
                <Button variant="outline" className="w-full" size="sm">
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Détails
                </Button>
              </Link>
              
              <Link 
                to={`/agencies/${agencyId}/properties/${property.id}/edit`}
                className="flex-1"
              >
                <Button variant="default" className="w-full" size="sm">
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Modifier
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
