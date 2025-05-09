import React, { useState, useEffect } from 'react';
import { 
  getAllSubscriptionPlans, 
  createSubscriptionPlan, 
  updateSubscriptionPlan, 
  deleteSubscriptionPlan 
} from '@/services/subscriptionService';
import { SubscriptionPlan } from '@/assets/types';
import { toast } from 'sonner';

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
import { PlusCircle, Pencil, Trash2, CheckCircle, XCircle, Plus } from 'lucide-react';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
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
      
      // Refresh the plans list
      fetchSubscriptionPlans();
      handleCloseDialog();
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
      
      if (success) {
        toast.success('Subscription plan deleted successfully');
        fetchSubscriptionPlans();
      }
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      toast.error('Failed to delete subscription plan');
    } finally {
      setConfirmDeleteDialog(false);
      setPlanToDelete(null);
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

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

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
              className="shrink-0"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Nouveau plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Limites</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Aucun plan d'abonnement trouvé. Créez votre premier plan!
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>
                      {plan.price.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                      <span className="text-muted-foreground ml-1 text-xs">
                        {plan.billingCycle === 'monthly' ? '/mois' : '/an'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {plan.billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}
                    </TableCell>
                    <TableCell>
                      {plan.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Inactif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs text-muted-foreground" title={`${plan.maxAgencies} agence(s), ${plan.maxProperties} propriété(s), ${plan.maxLeases} bail(baux), ${plan.maxShops} boutique(s), ${plan.maxProducts} produit(s)`}>
                        <span className="inline-flex gap-1.5 flex-wrap">
                          <Badge variant="outline" className="bg-background">{plan.maxAgencies} agence(s)</Badge>
                          <Badge variant="outline" className="bg-background">{plan.maxProperties} propriété(s)</Badge>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(plan)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => confirmDelete(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={plan.isActive ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20' : 'text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20'}
                          onClick={() => handleToggleActive(plan.id, plan.isActive)}
                        >
                          {plan.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subscription Plan Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogHeader>
          <DialogTitle>{editMode ? 'Modifier le plan' : 'Créer un nouveau plan'}</DialogTitle>
          <DialogDescription>
            Définissez les caractéristiques du plan d'abonnement
          </DialogDescription>
        </DialogHeader>

        <DialogContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du plan</Label>
              <Input
                id="name"
                name="name"
                placeholder="Basique, Premium, Pro..."
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billingCycle">Cycle de facturation</Label>
              <Select 
                name="billingCycle"
                value={formData.billingCycle}
                onValueChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    billingCycle: value
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                  <SelectItem value="annually">Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Prix</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">€</span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  className="pl-8"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-4 flex flex-col justify-center">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({
                      ...prev,
                      isActive: checked
                    }));
                  }}
                />
                <Label htmlFor="isActive">Plan actif</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasApiAccess"
                  name="hasApiAccess"
                  checked={formData.hasApiAccess}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({
                      ...prev,
                      hasApiAccess: checked
                    }));
                  }}
                />
                <Label htmlFor="hasApiAccess">Accès API</Label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium">Limites</h3>
              <Separator className="my-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxAgencies">Max Agences</Label>
                <Input
                  id="maxAgencies"
                  name="maxAgencies"
                  type="number"
                  value={formData.maxAgencies}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">Utilisez -1 pour illimité</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxProperties">Max Propriétés</Label>
                <Input
                  id="maxProperties"
                  name="maxProperties"
                  type="number"
                  value={formData.maxProperties}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">Utilisez -1 pour illimité</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxLeases">Max Baux</Label>
                <Input
                  id="maxLeases"
                  name="maxLeases"
                  type="number"
                  value={formData.maxLeases}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">Utilisez -1 pour illimité</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxShops">Max Boutiques</Label>
                <Input
                  id="maxShops"
                  name="maxShops"
                  type="number"
                  value={formData.maxShops}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">Utilisez -1 pour illimité</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxProducts">Max Produits</Label>
                <Input
                  id="maxProducts"
                  name="maxProducts"
                  type="number"
                  value={formData.maxProducts}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">Utilisez -1 pour illimité</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium">Fonctionnalités</h3>
              <Separator className="my-2" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Ajouter une fonctionnalité"
                  value={newFeature.text}
                  onChange={(e) => setNewFeature({ text: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleAddFeature}
                  disabled={!newFeature.text.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="border rounded-md p-4 min-h-[100px]">
                {formData.features.length === 0 ? (
                  <p className="text-center text-muted-foreground">Aucune fonctionnalité ajoutée</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {feature}
                        <button 
                          className="ml-1 rounded-full hover:bg-muted p-0.5"
                          onClick={() => handleRemoveFeature(index)}
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
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
            {editMode ? 'Mettre à jour' : 'Créer le plan'}
          </Button>
        </DialogFooter>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Plan Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="price"
                label="Price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                fullWidth
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Billing Cycle</InputLabel>
                <Select
                  name="billingCycle"
                  value={formData.billingCycle}
                  onChange={handleInputChange}
                  label="Billing Cycle"
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="annually">Annually</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Active"
              />
              <FormControlLabel
                control={
                  <Switch
                    name="hasApiAccess"
                    checked={formData.hasApiAccess}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="API Access"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Limits
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="maxAgencies"
                label="Max Agencies"
                type="number"
                value={formData.maxAgencies}
                onChange={handleInputChange}
                fullWidth
                helperText="Use -1 for unlimited"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="maxProperties"
                label="Max Properties"
                type="number"
                value={formData.maxProperties}
                onChange={handleInputChange}
                fullWidth
                helperText="Use -1 for unlimited"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="maxLeases"
                label="Max Leases"
                type="number"
                value={formData.maxLeases}
                onChange={handleInputChange}
                fullWidth
                helperText="Use -1 for unlimited"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="maxShops"
                label="Max Shops"
                type="number"
                value={formData.maxShops}
                onChange={handleInputChange}
                fullWidth
                helperText="Use -1 for unlimited"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="maxProducts"
                label="Max Products"
                type="number"
                value={formData.maxProducts}
                onChange={handleInputChange}
                fullWidth
                helperText="Use -1 for unlimited"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Features
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  label="Add feature"
                  value={newFeature.text}
                  onChange={(e) => setNewFeature({ text: e.target.value })}
                  fullWidth
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                />
                <IconButton 
                  color="primary" 
                  onClick={handleAddFeature}
                  sx={{ ml: 1 }}
                >
                  <AddCircleOutline />
                </IconButton>
              </Box>

              <Paper variant="outlined" sx={{ p: 2, minHeight: '100px' }}>
                {formData.features.length === 0 ? (
                  <Typography color="text.secondary" align="center">
                    No features added yet
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.features.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        onDelete={() => handleRemoveFeature(index)}
                      />
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={!formData.name || formData.price < 0}
          >
            {editMode ? 'Update Plan' : 'Create Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog 
        open={confirmDeleteDialog} 
        onClose={() => setConfirmDeleteDialog(false)}
      >
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
