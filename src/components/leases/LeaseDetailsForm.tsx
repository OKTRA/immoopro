
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property, ApartmentLease } from "@/assets/types";
import { Card } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";

interface LeaseDetailsFormProps {
  property: Property;
  initialData: Partial<ApartmentLease>;
  onUpdate: (data: Partial<ApartmentLease>) => void;
}

export default function LeaseDetailsForm({ property, initialData, onUpdate }: LeaseDetailsFormProps) {
  const [formData, setFormData] = useState({
    startDate: initialData.startDate || new Date().toISOString().split('T')[0],
    endDate: initialData.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    monthly_rent: initialData.monthly_rent?.toString() || property.price?.toString() || "0",
    security_deposit: initialData.security_deposit?.toString() || property.securityDeposit?.toString() || "0",
    payment_day: initialData.payment_day?.toString() || "1",
    lease_type: initialData.lease_type || getDefaultLeaseType(property.propertyCategory),
    has_renewal_option: initialData.has_renewal_option || false,
    special_conditions: initialData.special_conditions || "",
  });

  useEffect(() => {
    onUpdate({
      startDate: formData.startDate,
      endDate: formData.endDate,
      monthly_rent: parseFloat(formData.monthly_rent),
      security_deposit: parseFloat(formData.security_deposit),
      payment_day: parseInt(formData.payment_day),
      lease_type: formData.lease_type,
      has_renewal_option: formData.has_renewal_option,
      special_conditions: formData.special_conditions,
    });
  }, [formData, onUpdate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleDateSelect = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: date.toISOString().split('T')[0] }));
    }
  };

  function getDefaultLeaseType(propertyCategory?: string): string {
    switch (propertyCategory) {
      case 'residence':
        return 'residential';
      case 'apartment':
        return 'residential';
      case 'commercial':
        return 'commercial';
      case 'land':
        return 'land';
      default:
        return 'residential';
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Date de début</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.startDate 
                  ? format(new Date(formData.startDate), "P", { locale: fr })
                  : "Sélectionner une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.startDate ? new Date(formData.startDate) : undefined}
                onSelect={(date) => handleDateSelect("startDate", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Date de fin</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.endDate 
                  ? format(new Date(formData.endDate), "P", { locale: fr })
                  : "Sélectionner une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.endDate ? new Date(formData.endDate) : undefined}
                onSelect={(date) => handleDateSelect("endDate", date)}
                fromDate={formData.startDate ? new Date(formData.startDate) : undefined}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="monthly_rent">Loyer mensuel</Label>
          <div className="relative">
            <Input
              id="monthly_rent"
              name="monthly_rent"
              type="number"
              min="0"
              step="1"
              className="pl-8"
              value={formData.monthly_rent}
              onChange={handleChange}
              required
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">€</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="security_deposit">Dépôt de garantie</Label>
          <div className="relative">
            <Input
              id="security_deposit"
              name="security_deposit"
              type="number"
              min="0"
              step="1"
              className="pl-8"
              value={formData.security_deposit}
              onChange={handleChange}
              required
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">€</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="payment_day">Jour de paiement du loyer</Label>
          <Input
            id="payment_day"
            name="payment_day"
            type="number"
            min="1"
            max="31"
            value={formData.payment_day}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lease_type">Type de bail</Label>
          <Select name="lease_type" value={formData.lease_type} onValueChange={(value) => handleSelectChange("lease_type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Type de bail" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Bail résidentiel</SelectItem>
              <SelectItem value="commercial">Bail commercial</SelectItem>
              <SelectItem value="professional">Bail professionnel</SelectItem>
              <SelectItem value="furnished">Meublé</SelectItem>
              <SelectItem value="seasonal">Saisonnier</SelectItem>
              <SelectItem value="land">Terrain</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="has_renewal_option"
          checked={formData.has_renewal_option}
          onCheckedChange={(checked) => handleSwitchChange("has_renewal_option", checked)}
        />
        <Label htmlFor="has_renewal_option">Option de renouvellement</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="special_conditions">Conditions spéciales (optionnel)</Label>
        <Input
          id="special_conditions"
          name="special_conditions"
          placeholder="Conditions particulières du bail"
          value={formData.special_conditions}
          onChange={handleChange}
        />
      </div>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-2">Résumé du bail</p>
          <p>Durée: {calculateDuration(formData.startDate, formData.endDate)}</p>
          <p>Loyer mensuel: {parseFloat(formData.monthly_rent)} €</p>
          <p>Dépôt de garantie: {parseFloat(formData.security_deposit)} €</p>
          <p>Type de bail: {getLeaseTypeName(formData.lease_type)}</p>
        </div>
      </Card>
    </div>
  );
}

function calculateDuration(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return "-";
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = diffDays % 30;
  
  let result = "";
  if (years > 0) result += `${years} an${years > 1 ? 's' : ''} `;
  if (months > 0) result += `${months} mois `;
  if (days > 0) result += `${days} jour${days > 1 ? 's' : ''}`;
  
  return result.trim();
}

function getLeaseTypeName(type: string): string {
  const types: Record<string, string> = {
    'residential': 'Bail résidentiel',
    'commercial': 'Bail commercial',
    'professional': 'Bail professionnel',
    'furnished': 'Meublé',
    'seasonal': 'Saisonnier',
    'land': 'Terrain'
  };
  
  return types[type] || type;
}
