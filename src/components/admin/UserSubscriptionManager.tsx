import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PlusIcon, EditIcon, HistoryIcon, CreditCardIcon, ReceiptIcon, CalendarIcon, UserIcon, Building2Icon, CheckIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const UserSubscriptionManager: React.FC = () => {
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [assignFormData, setAssignFormData] = useState({
    userId: '',
    agencyId: '',
    planId: '',
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
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
          userEmail: user?.email || 'Unknown',
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          agencyName: agency?.name || null,
          plan: plan
        };
      }) : [];

      setUserSubscriptions(enhancedSubscriptions);
      setUsers(usersRes.users || []);
      setAgencies(agenciesRes.agencies || []);
      setPlans(plansRes.plans || []);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignDialog = (subscription?: UserSubscription) => {
    if (subscription) {
      // Edit mode
      setAssignFormData({
        userId: subscription.userId,
        agencyId: subscription.agencyId || '',
        planId: subscription.planId,
        startDate: new Date(subscription.startDate),
        endDate: new Date(subscription.endDate),
        autoRenew: subscription.autoRenew,
        assignType: subscription.agencyId ? 'agency' : 'user'
      });
      setSelectedSubscription(subscription);
    } else {
      // Create mode
      setAssignFormData({
        userId: '',
        agencyId: '',
        planId: '',
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        autoRenew: true,
        assignType: 'user'
      });
      setSelectedSubscription(null);
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
    setAssignFormData(prev => ({
      ...prev,
      assignType: value,
      userId: value === 'user' ? prev.userId : '',
      agencyId: value === 'agency' ? prev.agencyId : ''
    }));
  };

  const handleDateChange = (name: string, dateStr: string) => {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      setAssignFormData(prev => ({
        ...prev,
        [name]: date
      }));
    }
  };

  const handleAssignSubscription = async () => {
    try {
      const subscriptionData = {
        userId: assignFormData.assignType === 'user' ? assignFormData.userId : null,
        agencyId: assignFormData.assignType === 'agency' ? assignFormData.agencyId : null,
        planId: assignFormData.planId,
        startDate: assignFormData.startDate.toISOString(),
        endDate: assignFormData.endDate.toISOString(),
        autoRenew: assignFormData.autoRenew,
        status: 'active'
      };

      if (selectedSubscription) {
        // Update existing subscription
        const { subscription, error } = await updateUserSubscription(
          selectedSubscription.id,
          subscriptionData
        );
        
        if (error) {
          toast.error(`Error updating subscription: ${error}`);
          return;
        }
        
        toast.success('Subscription updated successfully');
      } else {
        // Create new subscription
        const { subscription, error } = await assignUserSubscription(subscriptionData);
        
        if (error) {
          toast.error(`Error assigning subscription: ${error}`);
          return;
        }
        
        toast.success('Subscription assigned successfully');
      }
      
      // Refresh subscriptions
      fetchData();
      handleCloseAssignDialog();
    } catch (error) {
      console.error('Error assigning subscription:', error);
      toast.error('Failed to assign subscription');
    }
  };

  const handleOpenHistoryDialog = async (subscription: UserSubscription) => {
    setSelectedSubscription(subscription);
    setOpenHistoryDialog(true);
    setLoadingHistory(true);
    
    try {
      const { history, error } = await getSubscriptionBillingHistory(subscription.id);
      
      if (error) {
        toast.error(`Error loading billing history: ${error}`);
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
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'expired':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'default';
    }
  };

  const pagedSubscriptions = userSubscriptions.slice(
    page * pageSize, 
    (page * pageSize) + pageSize
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gestion des abonnements utilisateurs</h3>
          <p className="text-sm text-muted-foreground">
            Attribuez et gérez les abonnements pour les utilisateurs et les agences.
          </p>
        </div>
        <Button 
          onClick={() => handleOpenAssignDialog()}
          className="ml-auto"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Assigner un abonnement
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="border rounded-md">
          {userSubscriptions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                Aucun abonnement trouvé. Assignez votre premier abonnement!
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur/Agence</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de début</TableHead>
                    <TableHead>Date de fin</TableHead>
                    <TableHead>Auto-renouvellement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedSubscriptions.map(subscription => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div className="font-medium">
                          {subscription.agencyId 
                            ? `${subscription.agencyName} (Agence)` 
                            : `${subscription.userName}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {subscription.userEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {subscription.plan?.name || 'Inconnu'}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {subscription.plan?.price?.toLocaleString()} FCFA / {subscription.plan?.billingCycle || 'mois'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(subscription.startDate)}</TableCell>
                      <TableCell>{formatDate(subscription.endDate)}</TableCell>
                      <TableCell>
                        <Badge variant={subscription.autoRenew ? "outline" : "secondary"}>
                          {subscription.autoRenew ? 'Oui' : 'Non'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleOpenAssignDialog(subscription)}
                                >
                                  <EditIcon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Modifier l'abonnement</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleOpenHistoryDialog(subscription)}
                                >
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

              <div className="flex items-center justify-end space-x-2 py-4 px-6 border-t">
                <div className="text-sm text-muted-foreground">
                  Page {page + 1} sur {Math.max(1, Math.ceil(userSubscriptions.length / pageSize))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * pageSize >= userSubscriptions.length}
                >
                  Suivant
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Assign/Edit Subscription Dialog */}
      <Dialog open={openAssignDialog} onOpenChange={handleCloseAssignDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {selectedSubscription ? 'Modifier l\'abonnement' : 'Assigner un nouvel abonnement'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="assignType">Assigner à</Label>
              <Tabs
                value={assignFormData.assignType}
                onValueChange={handleAssignTypeChange}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="user">Utilisateur</TabsTrigger>
                  <TabsTrigger value="agency">Agence</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {assignFormData.assignType === 'user' && (
              <div className="grid gap-2">
                <Label htmlFor="userId">Utilisateur</Label>
                <Select 
                  value={assignFormData.userId} 
                  onValueChange={(value) => handleInputChange('userId', value)}
                  disabled={!!selectedSubscription}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un utilisateur" />
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
              <div className="grid gap-2">
                <Label htmlFor="agencyId">Agence</Label>
                <Select 
                  value={assignFormData.agencyId} 
                  onValueChange={(value) => handleInputChange('agencyId', value)}
                  disabled={!!selectedSubscription}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une agence" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map(agency => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="planId">Plan d'abonnement</Label>
              <Select 
                value={assignFormData.planId} 
                onValueChange={(value) => handleInputChange('planId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price.toLocaleString()} FCFA/{plan.billingCycle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={assignFormData.startDate instanceof Date ? assignFormData.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={assignFormData.endDate instanceof Date ? assignFormData.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  min={assignFormData.startDate instanceof Date ? assignFormData.startDate.toISOString().split('T')[0] : ''}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="autoRenew"
                checked={assignFormData.autoRenew}
                onCheckedChange={(checked) => handleInputChange('autoRenew', checked)}
              />
              <Label htmlFor="autoRenew">Renouvellement automatique</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAssignDialog}>
              Annuler
            </Button>
            <Button
              onClick={handleAssignSubscription}
              disabled={
                (assignFormData.assignType === 'user' && !assignFormData.userId) ||
                (assignFormData.assignType === 'agency' && !assignFormData.agencyId) ||
                !assignFormData.planId
              }
            >
              {selectedSubscription ? 'Mettre à jour' : 'Assigner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing History Dialog */}
      <Dialog open={openHistoryDialog} onOpenChange={handleCloseHistoryDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Historique de facturation
            </DialogTitle>
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
          
          {loadingHistory ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : billingHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun historique de facturation trouvé pour cet abonnement.
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Moyen de paiement</TableHead>
                    <TableHead>Facture</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatDate(item.billingDate)}
                        </div>
                      </TableCell>
                      <TableCell>{item.amount.toLocaleString()} FCFA</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CreditCardIcon className="mr-2 h-4 w-4 text-muted-foreground" />
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
                              <ReceiptIcon className="mr-2 h-4 w-4" />
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
          
          <DialogFooter>
            <Button onClick={handleCloseHistoryDialog}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserSubscriptionManager;

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

const UserSubscriptionManager: React.FC = () => {
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
  
  const [assignFormData, setAssignFormData] = useState({
    userId: '',
    agencyId: '',
    planId: '',
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
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
      const enhancedSubscriptions = subscriptionsRes.subscriptions.map((sub: UserSubscription) => {
        const user = usersRes.users.find((u: User) => u.id === sub.userId);
        const agency = sub.agencyId ? agenciesRes.agencies.find((a: Agency) => a.id === sub.agencyId) : null;
        const plan = plansRes.plans.find((p: SubscriptionPlan) => p.id === sub.planId);
        
        return {
          ...sub,
          userEmail: user?.email || 'Unknown',
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          agencyName: agency?.name || null,
          plan: plan
        };
      });

      setUserSubscriptions(enhancedSubscriptions);
      setUsers(usersRes.users);
      setAgencies(agenciesRes.agencies);
      setPlans(plansRes.plans);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAssignDialog = (subscription?: UserSubscription) => {
    if (subscription) {
      // Edit mode
      setAssignFormData({
        userId: subscription.userId,
        agencyId: subscription.agencyId || '',
        planId: subscription.planId,
        startDate: new Date(subscription.startDate),
        endDate: new Date(subscription.endDate),
        autoRenew: subscription.autoRenew,
        assignType: subscription.agencyId ? 'agency' : 'user'
      });
      setSelectedSubscription(subscription);
    } else {
      // Create mode
      setAssignFormData({
        userId: '',
        agencyId: '',
        planId: '',
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        autoRenew: true,
        assignType: 'user'
      });
      setSelectedSubscription(null);
    }
    setOpenAssignDialog(true);
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setSelectedSubscription(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setAssignFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAssignTypeChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const value = e.target.value as string;
    setAssignFormData(prev => ({
      ...prev,
      assignType: value,
      userId: value === 'user' ? prev.userId : '',
      agencyId: value === 'agency' ? prev.agencyId : ''
    }));
  };

  const handleDateChange = (name: string, date: Date | null) => {
    if (date) {
      setAssignFormData(prev => ({
        ...prev,
        [name]: date
      }));
    }
  };

  const handleAssignSubscription = async () => {
    try {
      const subscriptionData = {
        userId: assignFormData.assignType === 'user' ? assignFormData.userId : null,
        agencyId: assignFormData.assignType === 'agency' ? assignFormData.agencyId : null,
        planId: assignFormData.planId,
        startDate: assignFormData.startDate.toISOString(),
        endDate: assignFormData.endDate.toISOString(),
        autoRenew: assignFormData.autoRenew,
        status: 'active'
      };

      if (selectedSubscription) {
        // Update existing subscription
        const { subscription, error } = await updateUserSubscription(
          selectedSubscription.id,
          subscriptionData
        );
        
        if (error) {
          toast.error(`Error updating subscription: ${error}`);
          return;
        }
        
        toast.success('Subscription updated successfully');
      } else {
        // Create new subscription
        const { subscription, error } = await assignUserSubscription(subscriptionData);
        
        if (error) {
          toast.error(`Error assigning subscription: ${error}`);
          return;
        }
        
        toast.success('Subscription assigned successfully');
      }
      
      // Refresh subscriptions
      fetchData();
      handleCloseAssignDialog();
    } catch (error) {
      console.error('Error assigning subscription:', error);
      toast.error('Failed to assign subscription');
    }
  };

  const handleOpenHistoryDialog = async (subscription: UserSubscription) => {
    setSelectedSubscription(subscription);
    setOpenHistoryDialog(true);
    setLoadingHistory(true);
    
    try {
      const { history, error } = await getSubscriptionBillingHistory(subscription.id);
      
      if (error) {
        toast.error(`Error loading billing history: ${error}`);
        return;
      }
      
      setBillingHistory(history);
    } catch (error) {
      console.error('Error fetching billing history:', error);
      toast.error('Failed to load billing history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseHistoryDialog = () => {
    setOpenHistoryDialog(false);
    setSelectedSubscription(null);
    setBillingHistory([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'expired':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'primary';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          User Subscription Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AssignmentIndIcon />}
          onClick={() => handleOpenAssignDialog()}
        >
          Assign New Subscription
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User/Agency</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Auto Renew</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No subscriptions found. Assign your first subscription!
                    </TableCell>
                  </TableRow>
                ) : (
                  userSubscriptions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(subscription => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {subscription.agencyId 
                              ? `${subscription.agencyName} (Agency)` 
                              : `${subscription.userName}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {subscription.userEmail}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={subscription.plan?.name || 'Unknown'}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {subscription.plan?.price?.toLocaleString()} FCFA / {subscription.plan?.billingCycle || 'month'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={subscription.status}
                            color={getStatusColor(subscription.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(subscription.startDate)}</TableCell>
                        <TableCell>{formatDate(subscription.endDate)}</TableCell>
                        <TableCell>
                          <Chip
                            label={subscription.autoRenew ? 'Yes' : 'No'}
                            color={subscription.autoRenew ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Subscription">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleOpenAssignDialog(subscription)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Billing History">
                              <IconButton 
                                size="small" 
                                color="secondary"
                                onClick={() => handleOpenHistoryDialog(subscription)}
                              >
                                <HistoryIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={userSubscriptions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Assign/Edit Subscription Dialog */}
      <Dialog 
        open={openAssignDialog} 
        onClose={handleCloseAssignDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedSubscription ? 'Edit Subscription' : 'Assign New Subscription'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  name="assignType"
                  value={assignFormData.assignType}
                  onChange={handleAssignTypeChange as any}
                  label="Assign To"
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="agency">Agency</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {assignFormData.assignType === 'user' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>User</InputLabel>
                  <Select
                    name="userId"
                    value={assignFormData.userId}
                    onChange={handleInputChange}
                    label="User"
                    disabled={!!selectedSubscription}
                  >
                    {users.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {assignFormData.assignType === 'agency' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Agency</InputLabel>
                  <Select
                    name="agencyId"
                    value={assignFormData.agencyId}
                    onChange={handleInputChange}
                    label="Agency"
                    disabled={!!selectedSubscription}
                  >
                    {agencies.map(agency => (
                      <MenuItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Subscription Plan</InputLabel>
                <Select
                  name="planId"
                  value={assignFormData.planId}
                  onChange={handleInputChange}
                  label="Subscription Plan"
                >
                  {plans.map(plan => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price.toLocaleString()} FCFA/{plan.billingCycle}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                value={assignFormData.startDate instanceof Date ? assignFormData.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : new Date();
                  handleDateChange('startDate', newDate);
                }}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
                type="date"
                value={assignFormData.endDate instanceof Date ? assignFormData.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : new Date();
                  handleDateChange('endDate', newDate);
                }}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: assignFormData.startDate instanceof Date ? 
                    assignFormData.startDate.toISOString().split('T')[0] : 
                    new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Auto Renew</InputLabel>
                <Select
                  name="autoRenew"
                  value={assignFormData.autoRenew}
                  onChange={handleInputChange}
                  label="Auto Renew"
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAssignSubscription}
            color="primary"
            variant="contained"
            disabled={
              (assignFormData.assignType === 'user' && !assignFormData.userId) ||
              (assignFormData.assignType === 'agency' && !assignFormData.agencyId) ||
              !assignFormData.planId
            }
          >
            {selectedSubscription ? 'Update Subscription' : 'Assign Subscription'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Billing History Dialog */}
      <Dialog
        open={openHistoryDialog}
        onClose={handleCloseHistoryDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Billing History
          {selectedSubscription && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedSubscription.agencyId 
                ? selectedSubscription.agencyName 
                : selectedSubscription.userName}
              {' - '}
              {selectedSubscription.plan?.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : billingHistory.length === 0 ? (
            <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
              No billing history found for this subscription.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Invoice</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {billingHistory.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {formatDate(item.billingDate)}
                        </Box>
                      </TableCell>
                      <TableCell>{item.amount.toLocaleString()} FCFA</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          color={getStatusColor(item.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CreditCardIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          {item.paymentMethod}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {item.invoiceUrl ? (
                          <Button
                            startIcon={<ReceiptIcon />}
                            variant="outlined"
                            size="small"
                            href={item.invoiceUrl}
                            target="_blank"
                          >
                            View
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Not available
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserSubscriptionManager;
