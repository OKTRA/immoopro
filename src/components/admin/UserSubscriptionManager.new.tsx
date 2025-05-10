import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  PlusIcon, 
  EditIcon, 
  HistoryIcon, 
  CreditCardIcon, 
  ReceiptIcon, 
  CalendarIcon, 
  UserIcon, 
  Building2Icon, 
  CheckIcon, 
  XIcon,
  Loader2Icon,
  Clock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

import { 
  getAllSubscriptionPlans, 
  getUserSubscription,
  assignUserSubscription,
  updateUserSubscription,
  getUserSubscriptions,
  getSubscriptionBillingHistory
} from '@/services/subscriptionService';
import { getAllUsers, getAllAgencies } from '@/services/admin/userService';
import { SubscriptionPlan } from '@/assets/types';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Agency {
  id: string;
  name: string;
  email: string;
}

interface UserSubscription {
  id: string;
  userId: string;
  agencyId: string | null;
  planId: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  plan?: SubscriptionPlan;
  userEmail?: string;
  userName?: string;
  agencyName?: string;
}

interface BillingHistoryItem {
  id: string;
  subscriptionId: string;
  amount: number;
  status: string;
  billingDate: string;
  paymentMethod: string;
  invoiceUrl: string;
}

const UserSubscriptionManager = () => {
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [assignFormData, setAssignFormData] = useState({
    userId: '',
    agencyId: '',
    planId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    autoRenew: true,
    assignType: 'user' // 'user' or 'agency'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all necessary data
      const [subscriptionsRes, usersRes, agenciesRes, plansRes] = await Promise.all([
        getUserSubscriptions(),
        getAllUsers(),
        getAllAgencies(),
        getAllSubscriptionPlans(true)
      ]);

      if (subscriptionsRes.error) toast.error(`Error loading subscriptions: ${subscriptionsRes.error}`);
      if (usersRes.error) toast.error(`Error loading users: ${usersRes.error}`);
      if (agenciesRes.error) toast.error(`Error loading agencies: ${agenciesRes.error}`);
      if (plansRes.error) toast.error(`Error loading plans: ${plansRes.error}`);

      // Add user and agency info to subscriptions
      const enhancedSubscriptions = subscriptionsRes.subscriptions ? subscriptionsRes.subscriptions.map((sub: UserSubscription) => {
        const user = usersRes.users ? usersRes.users.find((u: User) => u.id === sub.userId) : null;
        const agency = sub.agencyId && agenciesRes.agencies ? agenciesRes.agencies.find((a: Agency) => a.id === sub.agencyId) : null;
        const plan = plansRes.plans ? plansRes.plans.find((p: SubscriptionPlan) => p.id === sub.planId) : null;
        
        return {
          ...sub,
          userEmail: user ? user.email : 'Unknown',
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
          agencyName: agency ? agency.name : null,
          plan: plan || undefined
        };
      }) : [];

      setUserSubscriptions(enhancedSubscriptions);
      setUsers(usersRes.users || []);
      setAgencies(agenciesRes.agencies || []);
      setPlans(plansRes.plans || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (value: string) => {
    setRowsPerPage(parseInt(value, 10));
    setPage(0);
  };

  const handleOpenAssignDialog = (subscription?: UserSubscription) => {
    if (subscription) {
      setAssignFormData({
        userId: subscription.userId,
        agencyId: subscription.agencyId || '',
        planId: subscription.planId,
        startDate: subscription.startDate.split('T')[0],
        endDate: subscription.endDate.split('T')[0],
        autoRenew: subscription.autoRenew,
        assignType: subscription.agencyId ? 'agency' : 'user'
      });
      setSelectedSubscription(subscription);
      setEditMode(true);
    } else {
      setAssignFormData({
        userId: '',
        agencyId: '',
        planId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        autoRenew: true,
        assignType: 'user'
      });
      setSelectedSubscription(null);
      setEditMode(false);
    }
    setOpenAssignDialog(true);
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
  };

  const handleInputChange = (name: string, value: any) => {
    setAssignFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignTypeChange = (value: string) => {
    // Clear the user/agency specific field when changing assignment type
    setAssignFormData(prev => ({
      ...prev,
      assignType: value,
      userId: value === 'user' ? prev.userId : '',
      agencyId: value === 'agency' ? prev.agencyId : '',
    }));
  };

  const handleAssignSubscription = async () => {
    try {
      const formData = {
        ...assignFormData,
        userId: assignFormData.assignType === 'user' ? assignFormData.userId : '',
        agencyId: assignFormData.assignType === 'agency' ? assignFormData.agencyId : ''
      };

      if (editMode && selectedSubscription) {
        const { error } = await updateUserSubscription(selectedSubscription.id, formData);
        if (error) {
          toast.error(`Failed to update subscription: ${error}`);
          return;
        }
        toast.success('Subscription updated successfully');
      } else {
        const { error } = await assignUserSubscription(formData);
        if (error) {
          toast.error(`Failed to assign subscription: ${error}`);
          return;
        }
        toast.success('Subscription assigned successfully');
      }

      // Refresh data after successful operation
      fetchData();
      handleCloseAssignDialog();
    } catch (error) {
      console.error('Error processing subscription:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleOpenHistoryDialog = async (subscription: UserSubscription) => {
    setSelectedSubscription(subscription);
    setOpenHistoryDialog(true);
    setLoadingHistory(true);
    
    try {
      const { history, error } = await getSubscriptionBillingHistory(subscription.id);
      if (error) {
        toast.error(`Failed to load billing history: ${error}`);
        return;
      }
      
      setBillingHistory(history || []);
    } catch (error) {
      console.error('Error fetching billing history:', error);
      toast.error('Failed to load billing history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseHistoryDialog = () => {
    setOpenHistoryDialog(false);
    setBillingHistory([]);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'secondary';
      case 'expired':
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'default';
      default:
        return 'outline';
    }
  };

  // Calculate pagination
  const startIdx = page * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const paginatedSubscriptions = userSubscriptions.slice(startIdx, endIdx);
  const totalPages = Math.ceil(userSubscriptions.length / rowsPerPage);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestion des abonnements utilisateurs</CardTitle>
              <CardDescription>Gérez les abonnements des utilisateurs et des agences</CardDescription>
            </div>
            <Button onClick={() => handleOpenAssignDialog()}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Attribuer un abonnement
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : userSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun abonnement trouvé
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur/Agence</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Renouvellement</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubscriptions.map(subscription => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div className="font-medium">
                            {subscription.agencyId ? (
                              <div className="flex items-center">
                                <Building2Icon className="h-4 w-4 mr-2 text-muted-foreground" />
                                {subscription.agencyName}
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                {subscription.userName}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.userEmail}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {subscription.plan?.name || 'Plan inconnu'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.plan?.price.toLocaleString('fr-FR', { 
                              style: 'currency', 
                              currency: 'EUR' 
                            })}
                            /{subscription.plan?.billingCycle === 'monthly' ? 'mois' : 'an'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(subscription.status)}>
                            {subscription.status === 'active' ? (
                              <CheckIcon className="h-3.5 w-3.5 mr-1" />
                            ) : (
                              <XIcon className="h-3.5 w-3.5 mr-1" />
                            )}
                            {subscription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              Début: {formatDate(subscription.startDate)}
                            </div>
                            <div className="flex items-center mt-1">
                              <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              Fin: {formatDate(subscription.endDate)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={subscription.autoRenew ? "secondary" : "outline"}>
                            {subscription.autoRenew ? "Auto" : "Manuel"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleOpenAssignDialog(subscription)}>
                                    <EditIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Modifier</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleOpenHistoryDialog(subscription)}>
                                    <HistoryIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Historique de facturation</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Affichage de {startIdx + 1} à {Math.min(endIdx, userSubscriptions.length)} sur {userSubscriptions.length} abonnements
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleChangePage(page - 1)}
                    disabled={page === 0}
                  >
                    Précédent
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleChangePage(page + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Assign Subscription Dialog */}
      <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog}>
        <DialogHeader>
          <DialogTitle>
            {editMode ? 'Modifier l\'abonnement' : 'Attribuer un nouvel abonnement'}
          </DialogTitle>
          <DialogDescription>
            {editMode 
              ? 'Modifiez les détails de l\'abonnement existant' 
              : 'Sélectionnez un utilisateur ou une agence et attribuez-lui un plan d\'abonnement'}
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Type d'attribution</Label>
              <Select
                value={assignFormData.assignType}
                onValueChange={(value) => handleAssignTypeChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="agency">Agence</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {assignFormData.assignType === 'user' && (
              <div className="space-y-2">
                <Label htmlFor="userId">Utilisateur</Label>
                <Select
                  value={assignFormData.userId}
                  onValueChange={(value) => handleInputChange('userId', value)}
                  disabled={editMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {assignFormData.assignType === 'agency' && (
              <div className="space-y-2">
                <Label htmlFor="agencyId">Agence</Label>
                <Select
                  value={assignFormData.agencyId}
                  onValueChange={(value) => handleInputChange('agencyId', value)}
                  disabled={editMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une agence" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map(agency => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name} ({agency.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="planId">Plan d'abonnement</Label>
              <Select
                value={assignFormData.planId}
                onValueChange={(value) => handleInputChange('planId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.filter(plan => plan.isActive).map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}/
                      {plan.billingCycle === 'monthly' ? 'mois' : 'an'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={assignFormData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={assignFormData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="autoRenew"
                checked={assignFormData.autoRenew}
                onCheckedChange={(checked) => handleInputChange('autoRenew', checked)}
              />
              <Label htmlFor="autoRenew">Renouvellement automatique</Label>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseAssignDialog} className="mr-2">
            Annuler
          </Button>
          <Button 
            onClick={handleAssignSubscription}
            disabled={
              (assignFormData.assignType === 'user' && !assignFormData.userId) ||
              (assignFormData.assignType === 'agency' && !assignFormData.agencyId) ||
              !assignFormData.planId ||
              !assignFormData.startDate ||
              !assignFormData.endDate
            }
          >
            {editMode ? 'Mettre à jour' : 'Attribuer'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Billing History Dialog */}
      <Dialog open={openHistoryDialog} onClose={handleCloseHistoryDialog}>
        <DialogHeader>
          <DialogTitle>Historique de facturation</DialogTitle>
          {selectedSubscription && (
            <DialogDescription>
              {selectedSubscription.agencyId 
                ? selectedSubscription.agencyName 
                : selectedSubscription.userName}
              {' - '}
              {selectedSubscription.plan?.name}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogContent>
          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : billingHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun historique de facturation trouvé pour cet abonnement.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Méthode de paiement</TableHead>
                    <TableHead>Facture</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatDate(item.billingDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.amount.toLocaleString('fr-FR', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CreditCardIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          {item.paymentMethod}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.invoiceUrl ? (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={item.invoiceUrl} target="_blank" rel="noopener noreferrer">
                              <ReceiptIcon className="h-4 w-4 mr-2" />
                              Voir
                            </a>
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Non disponible
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button onClick={handleCloseHistoryDialog}>
            Fermer
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default UserSubscriptionManager;
