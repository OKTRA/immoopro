
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface DisplayStatus {
  label: string;
  variant: "default" | "destructive" | "secondary" | "success" | "outline";
}

interface PropertyStatusCardProps {
  statusInfo: DisplayStatus;
  hasActiveLeases: boolean;
}

export default function PropertyStatusCard({ statusInfo, hasActiveLeases }: PropertyStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statut de la propriété</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Statut actuel</span>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          
          {hasActiveLeases && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Bail</span>
              <Badge variant="success">Actif</Badge>
            </div>
          )}
          
          <Separator />
          
          <div className="pt-2">
            <Button className="w-full">
              Changer le statut
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
