import React, { useState, useEffect } from 'react';
import { 
  getAllUsersWithSubscriptions, 
  assignSubscriptionToUser,
  cancelUserSubscription,
  ensureDefaultFreePlanExists
} from '@/services/userSubscriptionService';
import { getAllSubscriptionPlans } from '@/services/subscriptionService';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  PlusCircle,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  X,
  Star,
  User,
  Package,
  Calendar,
  ArrowUpCircle
} from 'lucide-react';

interface UserWithSubscription {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  user_subscriptions?: {
    id: string;
    plan_id: string;
    start_date: string;
    end_date: string;
    status: string;
    auto_renew: boolean;
    subscription_plans?: SubscriptionPlan;
  }[] | null;
}

interface SubscriptionFormData {
  userId: string;
  userName: string;
  planId: string;
  agencyId?: string;
}

export default function UserSubscriptionsManagement() {
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    userId: '',
    userName: '',
    planId: ''
  });
  const [confirmCancelDialog, setConfirmCancelDialog] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // S'assurer qu'un plan gratuit existe
      await ensureDefaultFreePlanExists();
      
      // Charger tous les utilisateurs avec leurs abonnements
      const { users, error } = await getAllUsersWithSubscriptions();
      if (error) {
        toast.error(`Erreur lors du chargement des utilisateurs: ${error}`);
        return;
      }
      
      // Charger tous les plans d'abonnement
      const { plans: subscriptionPlans, error: plansError } = await getAllSubscriptionPlans();
      if (plansError) {
        toast.error(`Erreur lors du chargement des plans: ${plansError}`);
        return;
      }
      
      setUsers(users);
      setPlans(subscriptionPlans);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Échec du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignDialog = (user: UserWithSubscription) => {
    // Préremplir le formulaire avec les informations de l'utilisateur
    setFormData({
      userId: user.id,
      userName: `${user.first_name} ${user.last_name}`,
      planId: user.user_subscriptions?.[0]?.plan_id || '',
      agencyId: user.agency_id
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitAssignment = async () => {
    try {
      if (!formData.planId || !formData.userId) {
        toast.error('Veuillez sélectionner un plan d\'abonnement');
        return;
      }
      
      const { subscription, error } = await assignSubscriptionToUser(
        formData.userId,
        formData.planId,
        formData.agencyId
      );
      
      if (error) {
        toast.error(`Erreur lors de l'assignation de l'abonnement: ${error}`);
        return;
      }
      
      toast.success('Abonnement assigné avec succès');
      handleCloseDialog();
      loadData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de l\'assignation de l\'abonnement:', error);
      toast.error('Échec de l\'assignation de l\'abonnement');
    }
  };

  const confirmCancelSubscription = (subscriptionId: string) => {
    setSubscriptionToCancel(subscriptionId);
    setConfirmCancelDialog(true);
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionToCancel) return;
    
    try {
      const { success, error } = await cancelUserSubscription(subscriptionToCancel);
      
      if (error) {
        toast.error(`Erreur lors de l'annulation de l'abonnement: ${error}`);
        return;
      }
      
      toast.success('Abonnement annulé avec succès');
      setConfirmCancelDialog(false);
      setSubscriptionToCancel(null);
      loadData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
      toast.error('Échec de l\'annulation de l\'abonnement');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || email.includes(search);
  });

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Gestion des abonnements utilisateurs</CardTitle>
              <CardDescription>Assignez des plans d'abonnement aux utilisateurs</CardDescription>
            </div>
            <div className="w-full sm:w-auto">
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin mr-2">
                <PlusCircle className="h-6 w-6 opacity-50" />
              </div>
              <span>Chargement des utilisateurs...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Plan Actuel</TableHead>
                    <TableHead>État</TableHead>
                    <TableHead>Expire le</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => {
                    const subscription = user.user_subscriptions?.[0];
                    const plan = subscription?.subscription_plans;
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium">{user.first_name} {user.last_name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {plan ? (
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4 text-indigo-600" />
                              <span className="font-medium">{plan.name}</span>
                              {plan.price === 0 && (
                                <Badge variant="outline" className="ml-1 text-xs">
                                  Gratuit
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-600">
                              Aucun plan
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {subscription ? (
                            subscription.status === 'active' ? (
                              <Badge variant="success" className="bg-green-100 text-green-700 border-green-200">
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Actif
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                                <XCircle className="h-3.5 w-3.5 mr-1" /> {subscription.status}
                              </Badge>
                            )
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-600">
                              Non abonné
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {subscription?.end_date ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-slate-500" />
                              <span>{formatDate(subscription.end_date)}</span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenAssignDialog(user)}
                              className="flex items-center"
                            >
                              {subscription ? (
                                <>
                                  <ArrowUpCircle className="h-4 w-4 mr-1" />
                                  <span>Modifier</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-1" />
                                  <span>Assigner</span>
                                </>
                              )}
                            </Button>
                            {subscription && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => confirmCancelSubscription(subscription.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                <span>Annuler</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Subscription Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assigner un abonnement</DialogTitle>
            <DialogDescription>
              Choisissez un plan d'abonnement pour {formData.userName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="planId">Plan d'abonnement</Label>
              <Select
                value={formData.planId}
                onValueChange={(value) => handleSelectChange(value, 'planId')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{plan.name}</span>
                        <Badge className="ml-2">
                          {plan.price === 0 ? 'Gratuit' : `${plan.price.toLocaleString()} FCFA`}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.planId && (
              <div className="border rounded-md p-4 bg-slate-50 space-y-3">
                <h3 className="font-medium">Détails du plan sélectionné</h3>
                {plans.filter(p => p.id === formData.planId).map(plan => (
                  <div key={plan.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span>Prix:</span>
                      <Badge variant={plan.price === 0 ? "outline" : "default"}>
                        {plan.price === 0 ? 'Gratuit' : `${plan.price.toLocaleString()} FCFA`}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cycle de facturation:</span>
                      <span className="capitalize">{plan.billingCycle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Propriétés max:</span>
                      <span>{plan.maxProperties}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Utilisateurs max:</span>
                      <span>{plan.maxUsers}</span>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Fonctionnalités incluses:</h4>
                      <div className="flex flex-wrap gap-1">
                        {plan.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="bg-white">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-600" /> {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="py-6 px-8 bg-gray-50 dark:bg-gray-900 flex flex-col sm:flex-row gap-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleCloseDialog}
              className="py-2.5"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSubmitAssignment}
              disabled={!formData.planId || !formData.userId}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 text-base rounded-md shadow-sm"
            >
              <Star className="mr-1.5 h-5 w-5" /> ASSIGNER L'ABONNEMENT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Cancel Dialog */}
      <Dialog open={confirmCancelDialog} onOpenChange={setConfirmCancelDialog}>
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmer l'annulation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler cet abonnement ? L'utilisateur perdra l'accès aux fonctionnalités premium et reviendra au plan gratuit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmCancelDialog(false)} className="mr-2">
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
