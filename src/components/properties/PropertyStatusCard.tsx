
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Receipt } from "lucide-react";

interface DisplayStatus {
  label: string;
  variant: "default" | "destructive" | "secondary" | "success" | "outline";
}

interface PropertyStatusCardProps {
  statusInfo: DisplayStatus;
  hasActiveLeases: boolean;
  propertyId: string | undefined;
}

export default function PropertyStatusCard({ statusInfo, hasActiveLeases, propertyId }: PropertyStatusCardProps) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { agencyId } = useParams();

  const availableStatuses = [
    { value: "available", label: "Disponible" },
    { value: "pending", label: "En attente" },
    { value: "sold", label: "Vendu" },
    { value: "rented", label: "Loué" },
    { value: "occupied", label: "Occupé" }
  ];

  // Filter available statuses based on lease status
  const filteredStatuses = hasActiveLeases 
    ? availableStatuses.filter(status => ["rented", "occupied"].includes(status.value)) 
    : availableStatuses;

  const handleChangeStatus = async () => {
    if (!propertyId || !selectedStatus) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status: selectedStatus })
        .eq('id', propertyId);
        
      if (error) throw error;
      
      toast.success("Statut de la propriété mis à jour avec succès");
      setOpen(false);
      
      // Force page refresh to update UI
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating property status:", error);
      toast.error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToPayments = async () => {
    if (!propertyId || !agencyId) return;
    
    try {
      // Fetch the active lease for this property
      const { data, error } = await supabase
        .from('leases')
        .select('id')
        .eq('property_id', propertyId)
        .eq('status', 'active')
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const leaseId = data[0].id;
        navigate(`/agencies/${agencyId}/properties/${propertyId}/leases/${leaseId}/payments`);
      } else {
        toast.error("Aucun bail actif trouvé pour cette propriété");
      }
    } catch (error: any) {
      console.error("Error fetching lease:", error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  return (
    <>
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
            
            <div className="space-y-2 pt-2">
              <Button 
                className="w-full"
                onClick={() => setOpen(true)}
              >
                Changer le statut
              </Button>
              
              {hasActiveLeases && (
                <Button 
                  className="w-full"
                  variant="secondary"
                  onClick={handleNavigateToPayments}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Gestion des paiements
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Changer le statut de la propriété</DialogTitle>
            <DialogDescription>
              Sélectionnez le nouveau statut pour cette propriété
              {hasActiveLeases && " (Options limitées car un bail est actif)"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un statut" />
              </SelectTrigger>
              <SelectContent>
                {filteredStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleChangeStatus} 
              disabled={!selectedStatus || isLoading}
            >
              {isLoading ? "Mise à jour..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
