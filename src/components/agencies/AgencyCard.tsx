
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Star, CheckCircle } from "lucide-react";
import { Agency } from "@/assets/types";

interface AgencyCardProps {
  agency: Agency;
}

export default function AgencyCard({ agency }: AgencyCardProps) {
  const navigate = useNavigate();

  const handleCreateProperty = () => {
    navigate(`/agencies/${agency.id}/properties/create`);
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        <div className="h-36 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
          {agency.logoUrl ? (
            <img 
              src={agency.logoUrl} 
              alt={`${agency.name} logo`}
              className="h-20 w-20 object-contain rounded-full bg-white p-1"
            />
          ) : (
            <Building2 className="h-16 w-16 text-white" />
          )}
        </div>
        {agency.verified && (
          <div className="absolute top-2 right-2 bg-white rounded-full p-1">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        )}
      </div>

      <CardContent className="flex-grow pt-4">
        <h3 className="font-bold text-lg mb-1">{agency.name}</h3>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{agency.location}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Star className="h-4 w-4 mr-1 text-yellow-400 flex-shrink-0" />
          <span>{agency.rating} · {agency.properties} propriétés</span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-3">
          {agency.description || "Agence immobilière spécialisée dans la région."}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 border-t pt-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate(`/agencies/${agency.id}`)}
        >
          Voir les détails
        </Button>
        <Button 
          variant="default" 
          className="w-full"
          onClick={handleCreateProperty}
        >
          Créer une propriété
        </Button>
      </CardFooter>
    </Card>
  );
}
