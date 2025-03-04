import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property } from "@/assets/types";
import { Button } from "@/components/ui/button";

interface PropertyFinancialInfoFormProps {
  initialData: Partial<Property>;
  onChange: (data: Partial<Property>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function PropertyFinancialInfoForm({ initialData, onChange, onNext, onBack }: PropertyFinancialInfoFormProps) {
  const [formData, setFormData] = useState({
    price: initialData.price?.toString() || "",
    paymentFrequency: initialData.paymentFrequency || "monthly",
    securityDeposit: initialData.securityDeposit?.toString() || "",
    agencyFees: initialData.agencyFees?.toString() || "",
    commissionRate: initialData.commissionRate?.toString() || "",
  });

  useEffect(() => {
    onChange({
      price: parseFloat(formData.price) || 0,
      paymentFrequency: formData.paymentFrequency as "daily" | "weekly" | "monthly" | "quarterly" | "biannual" | "annual",
      securityDeposit: parseFloat(formData.securityDeposit) || undefined,
      agencyFees: parseFloat(formData.agencyFees) || undefined,
      commissionRate: parseFloat(formData.commissionRate) || undefined,
    });
  }, [formData, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Prix</Label>
          <div className="relative">
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="1"
              placeholder="Prix"
              className="pl-14"
              value={formData.price}
              onChange={handleChange}
              required
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">FCFA</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentFrequency">Fréquence de paiement</Label>
          <Select name="paymentFrequency" value={formData.paymentFrequency} onValueChange={(value) => handleSelectChange("paymentFrequency", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Fréquence" />
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

      <div className="space-y-2">
        <Label htmlFor="securityDeposit">Dépôt de garantie</Label>
        <div className="relative">
          <Input
            id="securityDeposit"
            name="securityDeposit"
            type="number"
            min="0"
            placeholder="Montant du dépôt de garantie"
            className="pl-14"
            value={formData.securityDeposit}
            onChange={handleChange}
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">FCFA</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Le dépôt de garantie est généralement équivalent à 1 ou 2 mois de loyer.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="agencyFees">Frais d'agence</Label>
          <div className="relative">
            <Input
              id="agencyFees"
              name="agencyFees"
              type="number"
              min="0"
              placeholder="Frais d'agence"
              className="pl-14"
              value={formData.agencyFees}
              onChange={handleChange}
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">FCFA</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commissionRate">Taux de commission (%)</Label>
          <div className="relative">
            <Input
              id="commissionRate"
              name="commissionRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="Taux de commission"
              className="pr-8"
              value={formData.commissionRate}
              onChange={handleChange}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2">%</span>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <p className="text-sm font-medium mb-2">Résumé financier</p>
        <div className="bg-muted p-4 rounded-md space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Prix</span>
            <span className="font-medium">{parseFloat(formData.price) || 0} FCFA ({getPaymentFrequencyLabel(formData.paymentFrequency)})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Dépôt de garantie</span>
            <span className="font-medium">{parseFloat(formData.securityDeposit) || 0} FCFA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Frais d'agence</span>
            <span className="font-medium">{parseFloat(formData.agencyFees) || 0} FCFA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Commission</span>
            <span className="font-medium">{parseFloat(formData.commissionRate) || 0} %</span>
          </div>
        </div>
      </div>

      {(onNext || onBack) && (
        <div className="flex justify-between pt-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Retour
            </Button>
          )}
          {onNext && (
            <Button type="button" onClick={onNext} className="ml-auto">
              Suivant
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
