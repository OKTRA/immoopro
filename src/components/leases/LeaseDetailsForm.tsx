
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property, ApartmentLease } from "@/assets/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface LeaseFormData {
  propertyId?: string;
  apartmentId?: string;
  tenantId?: string;
  startDate?: string;
  endDate?: string;
  paymentStartDate?: string;
  monthly_rent?: number;
  security_deposit?: number;
  payment_day?: number;
  is_active?: boolean;
  signed_by_tenant?: boolean;
  signed_by_owner?: boolean;
  has_renewal_option?: boolean;
  lease_type?: string;
  special_conditions?: string;
  status?: string;
  payment_frequency?: string;
}

interface LeaseDetailsFormProps {
  property: Property;
  initialData: Partial<LeaseFormData>;
  onUpdate: (data: Partial<LeaseFormData>) => void;
  quickAssign?: boolean;
}

export default function LeaseDetailsForm({ property, initialData, onUpdate, quickAssign = false }: LeaseDetailsFormProps) {
  const getDefaultDates = () => {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);
    
    return {
      startDate: initialData.startDate || today.toISOString().split('T')[0],
      endDate: initialData.endDate || nextYear.toISOString().split('T')[0],
      paymentStartDate: initialData.paymentStartDate || today.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultDates();

  const [formData, setFormData] = useState<LeaseFormData>({
    monthly_rent: property.price || 0,
    security_deposit: property.securityDeposit || property.price || 0,
    payment_day: 1,
    lease_type: property.propertyCategory || "residence",
    has_renewal_option: false,
    special_conditions: "",
    payment_frequency: property.paymentFrequency || "monthly",
    ...initialData,
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
    paymentStartDate: defaultDates.paymentStartDate
  });

  useEffect(() => {
    onUpdate(formData);
  }, [formData, onUpdate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getPaymentFrequencyLabel = (frequency: string): string => {
    const labels: Record<string, string> = {
      daily: "Journalier",
      weekly: "Hebdomadaire",
      monthly: "Mensuel",
      quarterly: "Trimestriel",
      biannual: "Semestriel",
      annual: "Annuel"
    };
    return labels[frequency] || "Mensuel";
  };

  // Calculate agency fees display
  const agencyFees = property.agencyFees || 0;

  return (
    <div className="space-y-6">
      {quickAssign && (
        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
          <Info className="h-4 w-4" />
          <AlertTitle>Mode d'attribution rapide</AlertTitle>
          <AlertDescription>
            Les valeurs par défaut ont été préremplies pour une attribution rapide. Vous pourrez modifier les détails complets du bail ultérieurement.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Date de début du bail</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Date de fin du bail</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentStartDate">Date de début des paiements</Label>
        <Input
          id="paymentStartDate"
          name="paymentStartDate"
          type="date"
          value={formData.paymentStartDate}
          onChange={handleChange}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Cette date sera utilisée pour générer l'historique des paiements réguliers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="monthly_rent">Loyer (FCFA)</Label>
          <div className="relative">
            <Input
              id="monthly_rent"
              name="monthly_rent"
              type="number"
              min="0"
              step="50"
              value={formData.monthly_rent}
              onChange={handleNumberChange}
              className="pl-14"
              required
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">FCFA</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment_frequency">Fréquence de paiement</Label>
          <Select 
            name="payment_frequency" 
            value={formData.payment_frequency} 
            onValueChange={(value) => handleSelectChange("payment_frequency", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une fréquence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Journalier</SelectItem>
              <SelectItem value="weekly">Hebdomadaire</SelectItem>
              <SelectItem value="monthly">Mensuel</SelectItem>
              <SelectItem value="quarterly">Trimestriel</SelectItem>
              <SelectItem value="biannual">Semestriel</SelectItem>
              <SelectItem value="annual">Annuel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="security_deposit">Caution (FCFA)</Label>
          <div className="relative">
            <Input
              id="security_deposit"
              name="security_deposit"
              type="number"
              min="0"
              step="50"
              value={formData.security_deposit}
              onChange={handleNumberChange}
              className="pl-14"
              required
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">FCFA</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Ce montant sera exigé comme paiement initial.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment_day">Jour de paiement du loyer</Label>
          <Input
            id="payment_day"
            name="payment_day"
            type="number"
            min="1"
            max="31"
            value={formData.payment_day}
            onChange={handleNumberChange}
            required
          />
        </div>
      </div>

      {!quickAssign && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lease_type">Type de bail</Label>
              <Select 
                name="lease_type" 
                value={formData.lease_type} 
                onValueChange={(value) => handleSelectChange("lease_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residence">Résidence principale</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="vacation">Location saisonnière</SelectItem>
                  <SelectItem value="student">Étudiant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 self-end">
              <Switch
                id="has_renewal_option"
                checked={formData.has_renewal_option}
                onCheckedChange={(checked) => handleSwitchChange("has_renewal_option", checked)}
              />
              <Label htmlFor="has_renewal_option">Option de renouvellement</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_conditions">Conditions particulières</Label>
            <Textarea
              id="special_conditions"
              name="special_conditions"
              placeholder="Conditions particulières du bail..."
              value={formData.special_conditions}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>
        </>
      )}

      <div className="pt-4">
        <p className="text-sm font-medium mb-2">Résumé financier</p>
        <div className="bg-muted p-4 rounded-md space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Loyer</span>
            <span className="font-medium">{formData.monthly_rent || 0} FCFA ({getPaymentFrequencyLabel(formData.payment_frequency || "monthly")})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Caution</span>
            <span className="font-medium">{formData.security_deposit || 0} FCFA</span>
          </div>
          {agencyFees > 0 && (
            <div className="flex justify-between">
              <span className="text-sm">Frais d'agence</span>
              <span className="font-medium">{agencyFees} FCFA</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm">Premier paiement</span>
            <span className="font-medium">{formData.paymentStartDate || formData.startDate || "-"}</span>
          </div>
          <div className="flex justify-between pt-2 border-t mt-2">
            <span className="text-sm font-medium">Paiements initiaux</span>
            <span className="font-medium">{(formData.security_deposit || 0) + agencyFees} FCFA</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Les paiements initiaux (caution et frais d'agence) seront automatiquement créés à la signature du bail.
        </p>
      </div>
    </div>
  );
}
