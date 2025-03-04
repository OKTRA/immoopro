
import React from 'react';
import { Property } from "@/assets/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin, Ruler, Hotel, Bath, Tag, Calendar, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PropertyDetailsDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyDetailsDialog({ property, isOpen, onClose }: PropertyDetailsDialogProps) {
  if (!property) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center w-full">
            <DialogTitle className="text-xl">{property.title}</DialogTitle>
            <Badge 
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
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image Gallery */}
          <div className="h-64 relative overflow-hidden rounded-md">
            {property.imageUrl ? (
              <img 
                src={property.imageUrl} 
                alt={property.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Home className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Price and Location */}
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-primary">
                {formatCurrency(property.price)}
              </h3>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location}</span>
              </div>
            </div>
            
            {/* Property Features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
              <div className="flex items-center space-x-2">
                <Ruler className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Surface</p>
                  <p className="font-medium">{property.area} m²</p>
                </div>
              </div>
              
              {property.bedrooms > 0 && (
                <div className="flex items-center space-x-2">
                  <Hotel className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Chambres</p>
                    <p className="font-medium">{property.bedrooms}</p>
                  </div>
                </div>
              )}
              
              {property.bathrooms > 0 && (
                <div className="flex items-center space-x-2">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Salles de bain</p>
                    <p className="font-medium">{property.bathrooms}</p>
                  </div>
                </div>
              )}
              
              {property.type && (
                <div className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{property.type}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Additional Information */}
            {property.description && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{property.description}</p>
              </div>
            )}
            
            {/* Additional features */}
            {property.features && property.features.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Caractéristiques</h4>
                <div className="grid grid-cols-2 gap-2">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Financial Information */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {property.securityDeposit && (
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dépôt de garantie</p>
                    <p className="font-medium">{formatCurrency(property.securityDeposit)}</p>
                  </div>
                </div>
              )}
              
              {property.agencyFees && (
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Frais d'agence</p>
                    <p className="font-medium">{formatCurrency(property.agencyFees)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
