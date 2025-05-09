import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const userEditSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
  role: z.string().min(1, { message: "Veuillez sélectionner un rôle" }),
  password: z.string().optional(),
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

interface UserEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUserUpdated: () => void;
}

export function UserEditForm({ isOpen, onClose, user, onUserUpdated }: UserEditFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      role: user.role || "public",
      password: "",
    },
  });

  React.useEffect(() => {
    form.reset({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      role: user.role || "public",
      password: "",
    });
  }, [user]);

  const onSubmit = async (data: UserEditFormValues) => {
    setIsSubmitting(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          role: data.role,
        })
        .eq("id", user.id);
      if (profileError) throw profileError;

      // Update email in auth if changed
      if (data.email !== user.email) {
        const { error: authError } = await supabase.auth.admin.updateUserById(user.id, { email: data.email });
        if (authError) throw authError;
      }

      // Update password if provided
      if (data.password && data.password.length >= 8) {
        const { error: passError } = await supabase.auth.admin.updateUserById(user.id, { password: data.password });
        if (passError) throw passError;
      }

      toast.success("Utilisateur mis à jour avec succès");
      onUserUpdated();
      onClose();
    } catch (error: any) {
      toast.error(`Erreur lors de la mise à jour: ${error.message || error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'utilisateur.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean" {...field} />
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
                      <Input placeholder="Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jean.dupont@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="owner">Propriétaire</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="tenant">Locataire</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Laisser vide pour ne pas changer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 