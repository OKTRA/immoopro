
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property, PropertyOwner } from "@/assets/types";
import { getPropertyOwners } from "@/services/propertyService";
import { useToast } from "@/components/ui/use-toast";

interface PropertyOwnershipFormProps {
  initialData: Partial<Property>;
  onUpdate: (data: Partial<Property>) => void;
}

export default function PropertyOwnershipForm({ initialData, onUpdate }: PropertyOwnershipFormProps) {
  const { toast } = useToast();
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownershipType, setOwnershipType] = useState<'agency' | 'owner'>(
    initialData.ownerId ? 'owner' : 'agency'
  );

  // Load property owners
  useEffect(() => {
    const fetchOwners = async () => {
      setLoading(true);
      const { owners, error } = await getPropertyOwners();
      if (error) {
        toast({
          title: "Erreur",
          description: `Erreur lors du chargement des propriétaires: ${error}`,
          variant: "destructive",
        });
        console.error("Error loading property owners:", error);
      } else {
        setOwners(owners || []);
      }
      setLoading(false);
    };

    fetchOwners();
  }, [toast]);

  // Handle ownership type change
  const handleOwnershipTypeChange = (value: 'agency' | 'owner') => {
    setOwnershipType(value);
    
    // Update the parent form with new ownership details
    if (value === 'agency') {
      onUpdate({ ownerId: undefined });
    } else {
      // For owner type, we don't set anything yet - will be set when specific owner is selected
    }
  };

  // Handle owner selection
  const handleOwnerSelect = (ownerId: string) => {
    onUpdate({ ownerId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Détails de propriété</h3>
        <p className="text-sm text-muted-foreground">
          Définissez la propriété et la gestion de ce bien immobilier.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Type de gestion</Label>
          <RadioGroup 
            value={ownershipType} 
            onValueChange={(v) => handleOwnershipTypeChange(v as 'agency' | 'owner')}
            className="flex flex-col space-y-1 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="agency" id="agency" />
              <Label htmlFor="agency" className="font-normal cursor-pointer">
                Géré par l'agence
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="owner" id="owner" />
              <Label htmlFor="owner" className="font-normal cursor-pointer">
                Propriétaire externe
              </Label>
            </div>
          </RadioGroup>
        </div>

        {ownershipType === 'owner' && (
          <div className="space-y-2">
            <Label htmlFor="owner">Propriétaire</Label>
            <Select 
              value={initialData.ownerId || ""} 
              onValueChange={handleOwnerSelect}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le propriétaire" />
              </SelectTrigger>
              <SelectContent>
                {owners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.name} {owner.companyName ? `(${owner.companyName})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loading && <p className="text-sm text-muted-foreground">Chargement des propriétaires...</p>}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="commission">Taux de commission (%)</Label>
          <Input
            id="commission"
            type="number"
            value={initialData.commissionRate || ""}
            onChange={(e) => onUpdate({ commissionRate: parseFloat(e.target.value) || 0 })}
            placeholder="ex: 5.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="agencyFees">Frais d'agence (€)</Label>
          <Input
            id="agencyFees"
            type="number"
            value={initialData.agencyFees || ""}
            onChange={(e) => onUpdate({ agencyFees: parseFloat(e.target.value) || 0 })}
            placeholder="ex: 1000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentFrequency">Fréquence de paiement</Label>
          <Select 
            value={initialData.paymentFrequency || ""} 
            onValueChange={(value) => onUpdate({ paymentFrequency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner la fréquence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensuel</SelectItem>
              <SelectItem value="quarterly">Trimestriel</SelectItem>
              <SelectItem value="biannual">Semestriel</SelectItem>
              <SelectItem value="annual">Annuel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="securityDeposit">Dépôt de garantie (€)</Label>
          <Input
            id="securityDeposit"
            type="number"
            value={initialData.securityDeposit || ""}
            onChange={(e) => onUpdate({ securityDeposit: parseFloat(e.target.value) || 0 })}
            placeholder="ex: 1000"
          />
        </div>
      </div>
    </div>
  );
}
