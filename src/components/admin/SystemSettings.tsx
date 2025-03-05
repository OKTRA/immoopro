
import React from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export default function SystemSettings() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Paramètres système</h1>
        <Button>Sauvegarder les modifications</Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="api">API & Intégrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
              <CardDescription>
                Configuration générale de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informations de base</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Nom du site</Label>
                    <Input id="site-name" defaultValue="ImmoAfrica" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-url">URL du site</Label>
                    <Input id="site-url" defaultValue="https://immoafrica.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email administrateur</Label>
                    <Input id="admin-email" defaultValue="admin@immoafrica.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-zone">Fuseau horaire</Label>
                    <Input id="time-zone" defaultValue="UTC+0" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Réglages des fonctionnalités</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="block">Inscription utilisateur</Label>
                      <p className="text-sm text-muted-foreground">
                        Autoriser les nouvelles inscriptions d'utilisateurs
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="block">Création d'agence</Label>
                      <p className="text-sm text-muted-foreground">
                        Autoriser les utilisateurs à créer des agences
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="block">Propriétés payantes</Label>
                      <p className="text-sm text-muted-foreground">
                        Activer les annonces premium payantes
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="block">Mode maintenance</Label>
                      <p className="text-sm text-muted-foreground">
                        Mettre le site en mode maintenance (accessible uniquement aux admins)
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sécurité</CardTitle>
              <CardDescription>
                Configuration de la sécurité et des accès
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-6">
                Les paramètres de sécurité avancés seront implémentés prochainement
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apparence & Design</CardTitle>
              <CardDescription>
                Configuration de l'apparence du site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-6">
                Les paramètres d'apparence avancés seront implémentés prochainement
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API & Intégrations</CardTitle>
              <CardDescription>
                Configuration des API et des services tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-6">
                Les paramètres d'API et d'intégration seront implémentés prochainement
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
