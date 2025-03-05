
import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Trash2, Tag } from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger 
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function SystemSettings() {
  const [subscriptionPlans, setSubscriptionPlans] = useState([
    { id: '1', name: 'Basic', price: 9.99, features: ['10 listings', 'Email support', 'Basic analytics'] },
    { id: '2', name: 'Premium', price: 29.99, features: ['50 listings', 'Priority support', 'Advanced analytics', 'Featured properties'] },
    { id: '3', name: 'Business', price: 99.99, features: ['Unlimited listings', '24/7 support', 'Full analytics suite', 'Featured properties', 'API access'] }
  ]);

  const [promoCodes, setPromoCodes] = useState([
    { id: '1', code: 'WELCOME10', discount: 10, type: 'percentage', validUntil: '2023-12-31', usageLimit: 100, usageCount: 45 },
    { id: '2', code: 'SUMMER2023', discount: 20, type: 'percentage', validUntil: '2023-09-30', usageLimit: 50, usageCount: 32 },
    { id: '3', code: 'AGENCY5', discount: 5, type: 'fixed', validUntil: '2023-10-15', usageLimit: 200, usageCount: 78 }
  ]);

  const [newPlan, setNewPlan] = useState({ name: '', price: 0, features: [''] });
  const [newPromoCode, setNewPromoCode] = useState({ 
    code: '', 
    discount: 0, 
    type: 'percentage', 
    validUntil: '', 
    usageLimit: 100,
    usageCount: 0
  });

  const handleAddFeature = () => {
    setNewPlan(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setNewPlan(prev => {
      const updatedFeatures = [...prev.features];
      updatedFeatures[index] = value;
      return {
        ...prev,
        features: updatedFeatures
      };
    });
  };

  const removeFeature = (index: number) => {
    setNewPlan(prev => {
      const updatedFeatures = [...prev.features];
      updatedFeatures.splice(index, 1);
      return {
        ...prev,
        features: updatedFeatures
      };
    });
  };

  const addPlan = () => {
    if (!newPlan.name || newPlan.price <= 0) {
      toast.error("Le nom et le prix sont requis");
      return;
    }

    const filteredFeatures = newPlan.features.filter(feature => feature.trim() !== '');
    
    if (filteredFeatures.length === 0) {
      toast.error("Ajoutez au moins une fonctionnalité");
      return;
    }

    setSubscriptionPlans(prev => [
      ...prev, 
      { 
        id: Date.now().toString(), 
        name: newPlan.name, 
        price: newPlan.price, 
        features: filteredFeatures 
      }
    ]);

    setNewPlan({ name: '', price: 0, features: [''] });
    toast.success("Plan d'abonnement ajouté avec succès");
  };

  const addPromoCode = () => {
    if (!newPromoCode.code || newPromoCode.discount <= 0 || !newPromoCode.validUntil) {
      toast.error("Tous les champs sont requis");
      return;
    }

    setPromoCodes(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        ...newPromoCode
      }
    ]);

    setNewPromoCode({ 
      code: '', 
      discount: 0, 
      type: 'percentage', 
      validUntil: '', 
      usageLimit: 100,
      usageCount: 0
    });

    toast.success("Code promo ajouté avec succès");
  };

  const deletePlan = (id: string) => {
    setSubscriptionPlans(prev => prev.filter(plan => plan.id !== id));
    toast.success("Plan supprimé avec succès");
  };

  const deletePromoCode = (id: string) => {
    setPromoCodes(prev => prev.filter(code => code.id !== id));
    toast.success("Code promo supprimé avec succès");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Paramètres système</h1>
        <Button>Sauvegarder les modifications</Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="pricing">Abonnements</TabsTrigger>
          <TabsTrigger value="promo">Codes Promo</TabsTrigger>
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

        <TabsContent value="pricing">
          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Plans d'abonnement</CardTitle>
                  <CardDescription>
                    Gérer les plans d'abonnement disponibles
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Ajouter un plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Ajouter un plan d'abonnement</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="plan-name">Nom du plan</Label>
                        <Input 
                          id="plan-name" 
                          value={newPlan.name}
                          onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                          placeholder="Premium" 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="plan-price">Prix mensuel (€)</Label>
                        <Input 
                          id="plan-price" 
                          type="number" 
                          value={newPlan.price || ''}
                          onChange={(e) => setNewPlan({...newPlan, price: parseFloat(e.target.value)})}
                          min="0" 
                          step="0.01" 
                          placeholder="29.99" 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Fonctionnalités</Label>
                        {newPlan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input 
                              value={feature}
                              onChange={(e) => handleFeatureChange(index, e.target.value)}
                              placeholder="50 listings" 
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeFeature(index)}
                              disabled={newPlan.features.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          onClick={handleAddFeature}
                          className="mt-2"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Ajouter une fonctionnalité
                        </Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={addPlan}>Ajouter le plan</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptionPlans.map((plan) => (
                    <div key={plan.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                      <div className="mb-2 sm:mb-0">
                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                        <p className="text-2xl font-bold">{plan.price}€<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
                        <ul className="mt-2 text-sm text-muted-foreground">
                          {plan.features.map((feature, index) => (
                            <li key={index}>✓ {feature}</li>
                          ))}
                        </ul>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deletePlan(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="promo">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Codes promotionnels</CardTitle>
                <CardDescription>
                  Gérer les codes promo et réductions
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Tag className="mr-2 h-4 w-4" />
                    Ajouter un code
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Ajouter un code promo</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="promo-code">Code</Label>
                      <Input 
                        id="promo-code" 
                        value={newPromoCode.code}
                        onChange={(e) => setNewPromoCode({...newPromoCode, code: e.target.value.toUpperCase()})}
                        placeholder="WELCOME10" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="discount">Réduction</Label>
                        <Input 
                          id="discount" 
                          type="number" 
                          value={newPromoCode.discount || ''}
                          onChange={(e) => setNewPromoCode({...newPromoCode, discount: parseFloat(e.target.value)})}
                          min="0" 
                          placeholder="10" 
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="discount-type">Type</Label>
                        <select 
                          id="discount-type"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={newPromoCode.type}
                          onChange={(e) => setNewPromoCode({...newPromoCode, type: e.target.value})}
                        >
                          <option value="percentage">Pourcentage (%)</option>
                          <option value="fixed">Montant fixe (€)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="valid-until">Valide jusqu'au</Label>
                      <Input 
                        id="valid-until" 
                        type="date" 
                        value={newPromoCode.validUntil}
                        onChange={(e) => setNewPromoCode({...newPromoCode, validUntil: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="usage-limit">Limite d'utilisation</Label>
                      <Input 
                        id="usage-limit" 
                        type="number" 
                        value={newPromoCode.usageLimit || ''}
                        onChange={(e) => setNewPromoCode({...newPromoCode, usageLimit: parseInt(e.target.value)})}
                        min="1" 
                        placeholder="100" 
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addPromoCode}>Ajouter le code</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50">
                    <tr>
                      <th scope="col" className="px-4 py-3">Code</th>
                      <th scope="col" className="px-4 py-3">Réduction</th>
                      <th scope="col" className="px-4 py-3">Validité</th>
                      <th scope="col" className="px-4 py-3">Utilisation</th>
                      <th scope="col" className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.map((code) => (
                      <tr key={code.id} className="border-b">
                        <td className="px-4 py-3 font-medium">{code.code}</td>
                        <td className="px-4 py-3">
                          {code.discount}{code.type === 'percentage' ? '%' : '€'}
                        </td>
                        <td className="px-4 py-3">{code.validUntil}</td>
                        <td className="px-4 py-3">
                          {code.usageCount} / {code.usageLimit}
                        </td>
                        <td className="px-4 py-3">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deletePromoCode(code.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
