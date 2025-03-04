
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash, Home } from "lucide-react";

interface PropertyDetailHeaderProps {
  property: any;
  agencyId: string | undefined;
  propertyId: string | undefined;
}

export default function PropertyDetailHeader({ property, agencyId, propertyId }: PropertyDetailHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => navigate(`/agencies/${agencyId}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à l'agence
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">{property.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/agencies/${agencyId}/properties/${propertyId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}
