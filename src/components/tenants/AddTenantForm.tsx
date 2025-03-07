
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createTenant } from "@/services/tenant/tenantService";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "Le prénom doit contenir au moins 2 caractères.",
  }),
  lastName: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  phone: z.string().min(8, {
    message: "Le numéro de téléphone doit contenir au moins 8 caractères.",
  }),
  profession: z.string().optional(),
  employmentStatus: z.string().optional(),
});

interface AddTenantFormProps {
  onCancel: () => void;
  onSuccess: (tenant: any) => void;
  agencyId?: string;
}

export default function AddTenantForm({ onCancel, onSuccess, agencyId }: AddTenantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      profession: "",
      employmentStatus: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!agencyId) {
      toast.error("ID d'agence manquant. Impossible de créer le locataire.");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Creating tenant with values:", values, "for agency:", agencyId);
      
      // Convert form values to the format expected by the API
      const tenantData = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
        profession: values.profession || null,
        employment_status: values.employmentStatus || null,
        agency_id: agencyId // Ensure the agency_id is included
      };

      const { tenant, error } = await createTenant(tenantData);

      if (error) {
        console.error("Error creating tenant:", error);
        throw new Error(error);
      }

      if (tenant) {
        toast.success("Locataire ajouté avec succès!");
        
        // Map back to the format expected by the parent component
        const mappedTenant = {
          id: tenant.id,
          firstName: tenant.first_name,
          lastName: tenant.last_name,
          email: tenant.email,
          phone: tenant.phone,
          profession: tenant.profession,
          employmentStatus: tenant.employment_status,
          hasLease: false
        };
        
        onSuccess(mappedTenant);
      }
    } catch (error: any) {
      console.error("Error in tenant creation:", error);
      toast.error(`Erreur lors de la création du locataire: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="shadow-md mb-8">
      <CardHeader>
        <CardTitle>Ajouter un nouveau locataire</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="+223 XX XX XX XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profession</FormLabel>
                    <FormControl>
                      <Input placeholder="Profession (optionnel)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employmentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut professionnel</FormLabel>
                    <FormControl>
                      <Input placeholder="Statut professionnel (optionnel)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onCancel} type="button">
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter le locataire
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
