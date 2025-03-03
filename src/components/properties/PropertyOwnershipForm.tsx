
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
  const [ownerType, setOwnerType] = useState("existing");
  const [formData, setFormData] = useState({
    ownerId: initialData.ownerId || "",
  });

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const { owners, error } = await getPropertyOwners();
        if (error) throw new Error(error);
        setOwners(owners);
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: `Impossible de récupérer les propriétaires: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, [toast]);

  useEffect(() => {
    onUpdate({
      ownerId: formData.ownerId || undefined,
    });
  }, [formData, onUpdate]);

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Type de propriétaire</Label>
        <RadioGroup
          value={ownerType}
          onValueChange={setOwnerType}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="existing" id="existing" />
            <Label htmlFor="existing" className="cursor-pointer">Propriétaire existant</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="agency" id="agency" />
            <Label htmlFor="agency" className="cursor-pointer">L'agence est propriétaire</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new" id="new" />
            <Label htmlFor="new" className="cursor-pointer">Nouveau propriétaire (sera créé après)</Label>
          </div>
        </RadioGroup>
      </div>

      {ownerType === "existing" && (
        <div className="space-y-2">
          <Label htmlFor="ownerId">Sélectionnez un propriétaire</Label>
          <Select name="ownerId" value={formData.ownerId} onValueChange={(value) => handleSelectChange("ownerId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un propriétaire" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>Chargement des propriétaires...</SelectItem>
              ) : owners.length > 0 ? (
                owners.map(owner => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.name || owner.companyName || `Propriétaire #${owner.id.substring(0, 8)}`}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>Aucun propriétaire disponible</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {ownerType === "new" && (
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Vous pourrez créer un nouveau propriétaire une fois la propriété enregistrée. 
            Pour l'instant, la propriété sera attribuée à l'agence.
          </p>
        </div>
      )}

      <div className="pt-2">
        <p className="text-sm text-muted-foreground italic">
          Note: Les détails de propriété comme les pourcentages d'ownership pourront être configurés ultérieurement.
        </p>
      </div>
    </div>
  );
}
