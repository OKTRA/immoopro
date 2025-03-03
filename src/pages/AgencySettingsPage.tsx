
import { useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Bell, Shield } from "lucide-react";

export default function AgencySettingsPage() {
  const { agencyId } = useParams();
  const [loading, setLoading] = useState(false);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Paramètres de l'agence</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="general">
            <Building2 className="h-4 w-4 mr-2" /> Général
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" /> Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" /> Sécurité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'agence</CardTitle>
              <CardDescription>
                Gérez les informations générales de votre agence.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agency-name">Nom de l'agence</Label>
                <Input id="agency-name" placeholder="Nom de l'agence" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agency-address">Adresse</Label>
                <Input id="agency-address" placeholder="Adresse de l'agence" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agency-phone">Téléphone</Label>
                <Input id="agency-phone" placeholder="Téléphone de l'agence" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agency-email">Email</Label>
                <Input id="agency-email" placeholder="Email de l'agence" type="email" />
              </div>
              <div className="flex justify-end pt-4">
                <Button disabled={loading}>
                  {loading ? "Mise à jour..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>
                Gérez les utilisateurs qui ont accès à cette agence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  La gestion des utilisateurs sera disponible prochainement.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de notification</CardTitle>
              <CardDescription>
                Configurez vos préférences de notification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Les paramètres de notification seront disponibles prochainement.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité et confidentialité</CardTitle>
              <CardDescription>
                Gérez les paramètres de sécurité et de confidentialité.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Les paramètres de sécurité et de confidentialité seront disponibles prochainement.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
