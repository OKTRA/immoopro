
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "./ui/AnimatedCard";
import { Property } from "@/assets/types";
import { MapPin, Home, Maximize2, BedDouble, Bath, Heart } from "lucide-react";
import AuthRequired from "./AuthRequired";

interface PropertyCardProps {
  property: Property;
  featured?: boolean;
}

export default function PropertyCard({ property, featured = false }: PropertyCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(property.price);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <AnimatedCard
      highlightOnHover={true}
      depthEffect={true}
      className="overflow-hidden h-full"
    >
      <div className="flex flex-col h-full">
        <div className="relative overflow-hidden aspect-video">
          <div className={cn(
            "absolute inset-0 bg-muted/30 flex items-center justify-center",
            isLoaded ? "opacity-0" : "opacity-100"
          )}>
            <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
          </div>
          
          <img
            src={property.imageUrl}
            alt={property.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-700",
              isLoaded ? "animate-image-load" : "opacity-0 blur-md scale-105"
            )}
            onLoad={handleImageLoad}
          />
          
          {featured && (
            <div className="absolute top-3 left-3">
              <span className="bg-primary text-primary-foreground text-xs font-medium py-1 px-2 rounded">
                Coup de cœur
              </span>
            </div>
          )}
          
          <AuthRequired fallback={
            <button 
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 text-muted-foreground hover:text-primary"
              title="Connectez-vous pour ajouter aux favoris"
              onClick={() => {/* Add login redirection here */}}
            >
              <Heart className="w-4 h-4" />
            </button>
          }>
            <button 
              className={cn(
                "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
                isFavorite 
                  ? "bg-primary/90 text-white" 
                  : "bg-white/90 text-muted-foreground hover:text-primary"
              )}
              onClick={toggleFavorite}
            >
              <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </AuthRequired>
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-lg leading-tight">{property.title}</p>
              <p className="text-muted-foreground text-sm flex items-center mt-1">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {property.location}
              </p>
            </div>
            <div className="text-primary font-semibold">
              {formattedPrice}
            </div>
          </div>
          
          <div className="border-t border-border/60 my-4"></div>
          
          <div className="grid grid-cols-3 gap-2 text-xs mt-auto">
            <div className="flex flex-col items-center p-1.5 bg-muted/60 rounded">
              <Home className="w-3.5 h-3.5 text-muted-foreground mb-1" />
              <span>{property.type}</span>
            </div>
            <div className="flex flex-col items-center p-1.5 bg-muted/60 rounded">
              <Maximize2 className="w-3.5 h-3.5 text-muted-foreground mb-1" />
              <span>{property.area} m²</span>
            </div>
            <div className="flex flex-col items-center p-1.5 bg-muted/60 rounded">
              <BedDouble className="w-3.5 h-3.5 text-muted-foreground mb-1" />
              <span>{property.bedrooms} ch.</span>
            </div>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
