import React, { useState, useEffect, KeyboardEvent } from 'react';
import { 
  getAllSubscriptionPlans, 
  createSubscriptionPlan, 
  updateSubscriptionPlan, 
  deleteSubscriptionPlan 
} from '@/services/subscriptionService';
import { SubscriptionPlan } from '@/assets/types';
import { toast } from 'sonner';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Pencil, Trash2, CheckCircle, XCircle, Plus, X } from 'lucide-react';

interface FeatureInput {
  text: string;
}

interface SubscriptionFormData {
  name: string;
  price: number;
  billingCycle: string;
  features: string[];
  maxAgencies: number;
  maxProperties: number;
  maxLeases: number;
  maxShops: number;
  maxProducts: number;
  isActive: boolean;
  hasApiAccess: boolean;
}

const initialFormState: SubscriptionFormData = {
  name: '',
  price: 0,
  billingCycle: 'monthly',
  features: [],
  maxAgencies: 1,
  maxProperties: 1,
  maxLeases: 2,
  maxShops: 1,
  maxProducts: 5,
  isActive: true,
  hasApiAccess: false
};

export default function SubscriptionPlansManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SubscriptionFormData>(initialFormState);
  const [newFeature, setNewFeature] = useState<FeatureInput>({ text: '' });
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    setLoading(true);
    try {
      const { plans, error } = await getAllSubscriptionPlans(false);
      
      if (error) {
        toast.error(`Error loading subscription plans: ${error}`);
        return;
      }
      
      setPlans(plans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (plan?: SubscriptionPlan) => {
    if (plan) {
      // Extract plan limits from features array or use default values
      const maxAgencies = plan.maxAgencies || 1;
      const maxProperties = plan.maxProperties || 1;
      const maxLeases = plan.maxLeases || 2;
      const maxShops = plan.maxShops || 1;
      const maxProducts = plan.maxProducts || 5;

      setFormData({
        name: plan.name,
        price: plan.price,
        billingCycle: plan.billingCycle || 'monthly',
        features: plan.features,
        maxAgencies,
        maxProperties,
        maxLeases,
        maxShops,
        maxProducts,
        isActive: plan.isActive || true,
        hasApiAccess: plan.hasApiAccess || false
      });
      setCurrentPlanId(plan.id);
      setEditMode(true);
    } else {
      setFormData(initialFormState);
      setCurrentPlanId(null);
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormState);
    setNewFeature({ text: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.text.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.text.trim()]
      }));
      setNewFeature({ text: '' });
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      // Create updated features array with limits
      const updatedFormData = {
        ...formData,
        maxUsers: formData.maxAgencies * 5, // Assuming 5 users per agency
        features: [
          ...formData.features,
        ]
      };

      if (editMode && currentPlanId) {
        // Update existing plan
        const { plan, error } = await updateSubscriptionPlan(currentPlanId, {
          name: updatedFormData.name,
          price: updatedFormData.price,
          billingCycle: updatedFormData.billingCycle,
          features: updatedFormData.features,
          isActive: updatedFormData.isActive,
          maxProperties: updatedFormData.maxProperties,
          maxUsers: updatedFormData.maxUsers,
          hasApiAccess: updatedFormData.hasApiAccess,
          maxAgencies: updatedFormData.maxAgencies,
          maxLeases: updatedFormData.maxLeases,
          maxShops: updatedFormData.maxShops,
          maxProducts: updatedFormData.maxProducts,
        });
        
        if (error) {
          toast.error(`Error updating plan: ${error}`);
          return;
        }
        
        toast.success('Subscription plan updated successfully');
      } else {
        // Create new plan
        const { plan, error } = await createSubscriptionPlan({
          name: updatedFormData.name,
          price: updatedFormData.price,
          billingCycle: updatedFormData.billingCycle,
          features: updatedFormData.features,
          isActive: updatedFormData.isActive,
          maxProperties: updatedFormData.maxProperties,
          maxUsers: updatedFormData.maxUsers,
          hasApiAccess: updatedFormData.hasApiAccess,
          maxAgencies: updatedFormData.maxAgencies,
          maxLeases: updatedFormData.maxLeases,
          maxShops: updatedFormData.maxShops,
          maxProducts: updatedFormData.maxProducts,
        });
        
        if (error) {
          toast.error(`Error creating plan: ${error}`);
          return;
        }
        
        toast.success('Subscription plan created successfully');
      }
      
      // Close dialog and refresh data
      handleCloseDialog();
      fetchSubscriptionPlans();
    } catch (error) {
      console.error('Error submitting subscription plan:', error);
      toast.error('Failed to save subscription plan');
    }
  };

  const confirmDelete = (id: string) => {
    setPlanToDelete(id);
    setConfirmDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!planToDelete) return;
    
    try {
      const { success, error } = await deleteSubscriptionPlan(planToDelete);
      
      if (error) {
        toast.error(`Error deleting plan: ${error}`);
        return;
      }
      
      toast.success('Subscription plan deleted successfully');
      setConfirmDeleteDialog(false);
      setPlanToDelete(null);
      fetchSubscriptionPlans();
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      toast.error('Failed to delete subscription plan');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { plan, error } = await updateSubscriptionPlan(id, {
        isActive: !currentStatus
      });
      
      if (error) {
        toast.error(`Error updating plan status: ${error}`);
        return;
      }
      
      toast.success(`Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchSubscriptionPlans();
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast.error('Failed to update plan status');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plans d'abonnement</CardTitle>
              <CardDescription>Gérez les formules d'abonnement proposées à vos clients</CardDescription>
            </div>
            <Button 
              onClick={() => handleOpenDialog()} 
              variant="default"
              className="ml-2"
            >
              <Plus className="mr-2 h-4 w-4" /> Ajouter un plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin mr-2">
                <PlusCircle className="h-6 w-6 opacity-50" />
              </div>
              <span>Chargement des plans...</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun plan d'abonnement trouvé</p>
              <Button 
                onClick={() => handleOpenDialog()} 
                variant="outline" 
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" /> Créer votre premier plan
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Cycle de facturation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>API Access</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map(plan => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{plan.price.toLocaleString()} FCFA</TableCell>
                    <TableCell className="capitalize">{plan.billingCycle || 'monthly'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={plan.isActive ? "success" : "secondary"} 
                        className="px-2 py-1"
                      >
                        {plan.isActive ? (
                          <span className="flex items-center">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Actif
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Inactif
                          </span>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {plan.hasApiAccess ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Oui
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">
                          <X className="h-3.5 w-3.5 mr-1" /> Non
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenDialog(plan)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant={plan.isActive ? "outline" : "secondary"} 
                          size="sm" 
                          onClick={() => handleToggleActive(plan.id, plan.isActive)}
                        >
                          {plan.isActive ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {plan.isActive ? 'Deactivate' : 'Activate'}
                          </span>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => confirmDelete(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogHeader>
          <DialogTitle>{editMode ? 'Modifier le plan' : 'Créer un nouveau plan'}</DialogTitle>
          <DialogDescription>
            {editMode 
              ? 'Modifiez les détails du plan d\'abonnement ci-dessous.' 
              : 'Remplissez les informations pour créer un nouveau plan d\'abonnement.'}
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="name">Nom du plan</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Basic, Premium, Enterprise"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="price">Prix (FCFA)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Ex: 15000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="billingCycle">Cycle de facturation</Label>
                <Select
                  value={formData.billingCycle}
                  onValueChange={(value) => handleSelectChange(value, 'billingCycle')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="annually">Annuel</SelectItem>
                    <SelectItem value="quarterly">Trimestriel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-4 justify-end">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleSwitchChange(checked, 'isActive')}
                  />
                  <Label htmlFor="isActive">Plan actif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasApiAccess"
                    checked={formData.hasApiAccess}
                    onCheckedChange={(checked) => handleSwitchChange(checked, 'hasApiAccess')}
                  />
                  <Label htmlFor="hasApiAccess">Accès API</Label>
                </div>
              </div>
            </div>

            <Separator className="my-2" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="maxAgencies">Agences max</Label>
                <Input
                  id="maxAgencies"
                  name="maxAgencies"
                  type="number"
                  value={formData.maxAgencies}
                  onChange={handleInputChange}
                  placeholder="Ex: 1"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="maxProperties">Propriétés max</Label>
                <Input
                  id="maxProperties"
                  name="maxProperties"
                  type="number"
                  value={formData.maxProperties}
                  onChange={handleInputChange}
                  placeholder="Ex: 10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="maxLeases">Baux max</Label>
                <Input
                  id="maxLeases"
                  name="maxLeases"
                  type="number"
                  value={formData.maxLeases}
                  onChange={handleInputChange}
                  placeholder="Ex: 5"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="maxShops">Boutiques max</Label>
                <Input
                  id="maxShops"
                  name="maxShops"
                  type="number"
                  value={formData.maxShops}
                  onChange={handleInputChange}
                  placeholder="Ex: 1"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="maxProducts">Produits max</Label>
                <Input
                  id="maxProducts"
                  name="maxProducts"
                  type="number"
                  value={formData.maxProducts}
                  onChange={handleInputChange}
                  placeholder="Ex: 50"
                />
              </div>
            </div>

            <Separator className="my-2" />

            <div className="flex flex-col space-y-2">
              <Label>Fonctionnalités</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={newFeature.text}
                  onChange={(e) => setNewFeature({ text: e.target.value })}
                  onKeyPress={handleKeyPress}
                  placeholder="Ajouter une fonctionnalité..."
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddFeature}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 border rounded-md min-h-[100px] mt-2">
                {formData.features.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    Aucune fonctionnalité ajoutée
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="px-2 py-1 flex items-center gap-1"
                      >
                        {feature}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleRemoveFeature(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseDialog} className="mr-2">
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.name || formData.price < 0}
          >
            {editMode ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer ce plan d'abonnement ? Cette action ne peut pas être annulée.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setConfirmDeleteDialog(false)} className="mr-2">
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Supprimer
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
