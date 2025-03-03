
import { Agency } from "@/assets/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Building, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface AgencyCardProps {
  agency: Agency;
}

export default function AgencyCard({ agency }: AgencyCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 relative">
        {agency.logoUrl && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <img
              src={agency.logoUrl}
              alt={`${agency.name} logo`}
              className="h-16 w-16 rounded-full border-2 border-white bg-white object-cover"
            />
          </div>
        )}
      </div>
      <CardHeader className="pt-10">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{agency.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {agency.location}
            </CardDescription>
          </div>
          {agency.verified && (
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" /> Vérifiée
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-1" />
            <span>{agency.properties} propriétés</span>
          </div>
          <div>
            <span className="font-medium text-orange-500">{agency.rating}</span>
            <span className="text-muted-foreground">/5</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" asChild>
          <Link to={`/agencies/${agency.id}`}>Voir le profil</Link>
        </Button>
        <Button asChild>
          <Link to={`/agencies/${agency.id}/properties/create`}>
            <Plus className="h-4 w-4 mr-2" /> Ajouter une propriété
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
