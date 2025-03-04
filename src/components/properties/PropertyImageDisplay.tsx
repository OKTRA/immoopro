
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Home } from "lucide-react";

interface DisplayStatus {
  label: string;
  variant: "default" | "destructive" | "secondary" | "success" | "outline";
}

interface PropertyImageDisplayProps {
  property: any;
  statusInfo: DisplayStatus;
}

export default function PropertyImageDisplay({ property, statusInfo }: PropertyImageDisplayProps) {
  return (
    <div className="mb-8 relative overflow-hidden rounded-lg h-96">
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
      <Badge 
        className="absolute top-4 right-4 text-sm px-3 py-1" 
        variant={statusInfo.variant}
      >
        {statusInfo.label}
      </Badge>
    </div>
  );
}
