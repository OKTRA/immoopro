
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedCard } from "./ui/AnimatedCard";
import { Agency } from "@/assets/types";
import { MapPin, Building, Star, BadgeCheck } from "lucide-react";

interface AgencyCardProps {
  agency: Agency;
}

export default function AgencyCard({ agency }: AgencyCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <AnimatedCard
      highlightOnHover={true}
      className="overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="relative w-16 h-16 mr-4 rounded-full overflow-hidden bg-muted/30 flex-shrink-0">
            <div className={cn(
              "absolute inset-0 flex items-center justify-center",
              isLoaded ? "opacity-0" : "opacity-100"
            )}>
              <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
            </div>
            
            <img
              src={agency.logoUrl}
              alt={agency.name}
              className={cn(
                "w-full h-full object-cover",
                isLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={handleImageLoad}
            />
          </div>
          
          <div>
            <div className="flex items-center">
              <h3 className="font-semibold text-lg">{agency.name}</h3>
              {agency.verified && (
                <BadgeCheck className="w-4 h-4 ml-1.5 text-primary" />
              )}
            </div>
            
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {agency.location}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/60">
          <div className="flex items-center text-sm">
            <Building className="w-4 h-4 mr-1.5 text-muted-foreground" />
            <span>{agency.properties} propriétés</span>
          </div>
          
          <div className="flex items-center text-sm">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < agency.rating ? "text-amber-400 fill-amber-400" : "text-muted"
                  )}
                />
              ))}
            </div>
            <span className="ml-1.5">{agency.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
