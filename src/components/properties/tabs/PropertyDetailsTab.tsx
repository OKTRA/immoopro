
import React from 'react';
import { Ruler, Hotel, Bath, Tag, MapPin } from "lucide-react";

interface PropertyDetailsTabProps {
  property: any;
}

export default function PropertyDetailsTab({ property }: PropertyDetailsTabProps) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-muted/40 p-4 rounded-lg text-center">
          <Ruler className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">Surface</div>
          <div className="font-medium">{property.area} m²</div>
        </div>
        <div className="bg-muted/40 p-4 rounded-lg text-center">
          <Hotel className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">Chambres</div>
          <div className="font-medium">{property.bedrooms}</div>
        </div>
        <div className="bg-muted/40 p-4 rounded-lg text-center">
          <Bath className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">Salles de bain</div>
          <div className="font-medium">{property.bathrooms}</div>
        </div>
        <div className="bg-muted/40 p-4 rounded-lg text-center">
          <Tag className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">Type</div>
          <div className="font-medium">{property.type}</div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Localisation</h3>
        <div className="flex items-center text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{property.location}</span>
        </div>
      </div>

      {property.features && property.features.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Caractéristiques</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {property.features.map((feature: string, index: number) => (
              <div key={index} className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Description</h3>
        <p className="text-muted-foreground whitespace-pre-line">
          {property.description || "Aucune description disponible pour cette propriété."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {property.yearBuilt && (
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-muted-foreground">Année de construction</span>
            <span className="font-medium">{property.yearBuilt}</span>
          </div>
        )}
        {property.propertyCategory && (
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-muted-foreground">Catégorie</span>
            <span className="font-medium">{property.propertyCategory}</span>
          </div>
        )}
      </div>
    </div>
  );
}
