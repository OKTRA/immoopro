import React, { useState } from "react";
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
import { Loader2, ArrowRight, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Schéma pour l'étape 1 : Création du compte d'authentification
const authFormSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
});

type AuthFormValues = z.infer<typeof authFormSchema>;

// Schéma pour l'étape 2 : Informations du profil utilisateur
const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  lastName: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  role: z.string().min(1, { message: "Veuillez sélectionner un rôle" }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export function UserCreationDialog({
  isOpen,
  onClose,
  onUserCreated,
}: UserCreationDialogProps) {
  // États pour gérer le processus en deux étapes
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  
  // États pour la recherche d'utilisateur existant
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ exists: boolean; userId?: string; profile?: any } | null>(null);

  // Formulaire pour l'étape 1 (authentification)
  const authForm = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Formulaire pour l'étape 2 (profil)
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "public",
    },
  });

  // Réinitialiser le formulaire et l'état lors de la fermeture
  const handleClose = () => {
    setStep(1);
    authForm.reset();
    profileForm.reset();
    setUserId(null);
    setUserEmail("");
    setSearchEmail("");
    setSearchResult(null);
    onClose();
  };
  
  // Rechercher un utilisateur existant par email
  const searchUserByEmail = async () => {
    if (!searchEmail || searchEmail.trim() === "") {
      toast.error("Veuillez saisir une adresse e-mail pour la recherche");
      return;
    }
    
    setIsSearching(true);
    setSearchResult(null);
    
    try {
      // 1. Rechercher dans la table profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', searchEmail.trim())
        .single();
        
      if (profileData) {
        // Utilisateur trouvé
        setSearchResult({
          exists: true,
          userId: profileData.id,
          profile: profileData
        });
        
        // Pré-remplir les formulaires
        setUserId(profileData.id);
        setUserEmail(profileData.email);
        
        // Pré-remplir le formulaire de profil avec les données existantes
        profileForm.setValue("firstName", profileData.first_name || "");
        profileForm.setValue("lastName", profileData.last_name || "");
        profileForm.setValue("role", profileData.role || "public");
        
        toast.success("Utilisateur trouvé ! Vous pouvez mettre à jour son profil.");
        return;
      }
      
      // 2. Si non trouvé dans profiles, essayer dans auth.users
      // Note: Cette partie nécessiterait des droits admin, mais nous pouvons
      // au moins tenter de créer l'utilisateur pour voir s'il existe déjà
      setSearchResult({
        exists: false
      });
      
      // Pré-remplir le formulaire d'authentification avec l'email recherché
      authForm.setValue("email", searchEmail);
      
    } catch (error: any) {
      console.error("Erreur lors de la recherche de l'utilisateur:", error);
      toast.error(`Erreur: ${error.message}`);
      setSearchResult({ exists: false });
    } finally {
      setIsSearching(false);
    }
  };

  // Étape 1 : Création ou Vérification de l'utilisateur dans l'authentification Supabase
  const onSubmitAuth = async (data: AuthFormValues) => {
    setIsSubmitting(true);
    try {
      // Créer l'utilisateur dans le système d'authentification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      // Si l'erreur n'est pas "user_already_exists", la lancer comme une vraie erreur
      if (authError && authError.code !== "user_already_exists") {
        throw authError;
      }

      // Si l'utilisateur existe déjà, essayons de nous connecter pour récupérer l'ID
      if (authError && authError.code === "user_already_exists") {
        // Essayer de se connecter avec les identifiants fournis
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) {
          // Si la connexion échoue (mauvais mot de passe pour un compte existant)
          throw new Error("L'utilisateur existe déjà mais le mot de passe est incorrect");
        }

        if (signInData.user) {
          // Stocker l'identifiant utilisateur pour l'étape 2
          setUserId(signInData.user.id);
          setUserEmail(data.email);
          setStep(2); // Passer à l'étape 2
          toast.success("Utilisateur existant, vous pouvez mettre à jour ses informations");
          return;
        }
      }

      // Cas normal: nouvel utilisateur créé
      if (authData && authData.user) {
        // Stocker l'identifiant utilisateur pour l'étape 2
        setUserId(authData.user.id);
        setUserEmail(data.email);
        setStep(2); // Passer à l'étape 2
        toast.success("Compte créé, complétez maintenant le profil");
      }
    } catch (error: any) {
      console.error("Erreur lors de la création du compte:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Étape 2 : Ajout ou mise à jour des informations de profil
  const onSubmitProfile = async (data: ProfileFormValues) => {
    if (!userId) {
      toast.error("Erreur: Identifiant utilisateur manquant");
      return;
    }

    setIsSubmitting(true);
    try {
      // Déterminer si c'est une création ou une mise à jour
      const isUpdate = searchResult && searchResult.exists;
      
      // Créer ou mettre à jour le profil utilisateur
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        first_name: data.firstName,
        last_name: data.lastName,
        email: userEmail,
        role: data.role,
        updated_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      // Message adapté selon l'action (création ou mise à jour)
      if (isUpdate) {
        toast.success("Profil utilisateur mis à jour avec succès");
      } else {
        toast.success("Nouvel utilisateur créé avec succès");
      }
      
      handleClose();
      onUserCreated();
    } catch (error: any) {
      console.error("Erreur lors de la gestion du profil:", error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
          <DialogDescription>
            {searchResult && searchResult.exists 
              ? "Mise à jour des informations de l'utilisateur existant" 
              : step === 1
                ? "Étape 1: Création du compte d'authentification"
                : "Étape 2: Informations de profil"}
          </DialogDescription>
        </DialogHeader>
        
        {/* Recherche d'utilisateur existant */}
        {!searchResult && step === 1 && (
          <div className="border rounded-md p-4 mb-4 bg-muted/30">
            <h4 className="font-medium mb-2">Vérifier si l'utilisateur existe déjà</h4>
            <div className="flex gap-2 mb-2">
              <Input 
                placeholder="Rechercher par email" 
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={searchUserByEmail} 
                disabled={isSearching || !searchEmail}
                size="sm"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Vérifier"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Recherchez un utilisateur existant avant de créer un compte pour éviter les doublons
            </p>
          </div>
        )}
        
        {/* Affichage du résultat de recherche */}
        {searchResult && (
          <Card className={`mb-4 ${searchResult.exists ? "border-green-500/50" : "border-orange-500/50"}`}>
            <CardContent className="p-4">
              {searchResult.exists ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="font-medium">Utilisateur trouvé</span>
                  </div>
                  <p className="text-sm">Cet utilisateur existe déjà dans le système.</p>
                  {searchResult.profile && (
                    <div className="text-xs space-y-1">
                      <div>Email: <span className="font-medium">{searchResult.profile.email}</span></div>
                      <div>Nom: <span className="font-medium">{searchResult.profile.first_name} {searchResult.profile.last_name}</span></div>
                      <div>Rôle: <span className="font-medium">{searchResult.profile.role}</span></div>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setStep(2)}
                  >
                    Mettre à jour le profil
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span className="font-medium">Utilisateur non trouvé</span>
                  </div>
                  <p className="text-sm">Vous pouvez créer un nouveau compte pour cet utilisateur.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Indicateur de progression */}
        <div className="mb-4">
          <Progress value={step === 1 ? 50 : 100} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <div className={step === 1 ? "font-bold" : ""}>Compte</div>
            <div className={step === 2 ? "font-bold" : ""}>Profil</div>
          </div>
        </div>

        {/* Étape 1: Création du compte */}
        {step === 1 && (
          <Form {...authForm}>
            <form onSubmit={authForm.handleSubmit(onSubmitAuth)} className="space-y-4">
              <FormField
                control={authForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jean.dupont@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={authForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création du compte...
                    </>
                  ) : (
                    <>
                      Continuer <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {/* Étape 2: Création du profil */}
        {step === 2 && (
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
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
                  control={profileForm.control}
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
                control={profileForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Utilisateur</SelectItem>
                        <SelectItem value="owner">Propriétaire</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="tenant">Locataire</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Le champ téléphone a été supprimé car il n'existe pas dans la table profiles */}

              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">
                    Email: <span className="font-medium text-foreground">{userEmail}</span>
                  </p>
                </CardContent>
              </Card>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  Retour
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Complétion du profil...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Finaliser la création
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
