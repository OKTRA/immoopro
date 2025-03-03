
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tenant } from "@/assets/types";

interface TenantFormProps {
  initialData: Partial<Tenant>;
  onUpdate: (data: Partial<Tenant>) => void;
}

export default function TenantForm({ initialData, onUpdate }: TenantFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    employmentStatus: initialData.employmentStatus || "",
  });

  useEffect(() => {
    onUpdate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      employmentStatus: formData.employmentStatus,
    });
  }, [formData, onUpdate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Prénom du locataire"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Nom du locataire"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Email du locataire"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Numéro de téléphone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="employmentStatus">Situation professionnelle</Label>
        <Select 
          name="employmentStatus" 
          value={formData.employmentStatus} 
          onValueChange={(value) => handleSelectChange("employmentStatus", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une situation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employed">Salarié</SelectItem>
            <SelectItem value="self-employed">Travailleur indépendant</SelectItem>
            <SelectItem value="student">Étudiant</SelectItem>
            <SelectItem value="retired">Retraité</SelectItem>
            <SelectItem value="unemployed">Sans emploi</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
