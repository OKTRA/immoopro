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
  Loader2Icon
} from 'lucide-react';

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
    page * rowsPerPage, 
    (page * rowsPerPage) + rowsPerPage
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
                  Page {page + 1} sur {Math.max(1, Math.ceil(userSubscriptions.length / rowsPerPage))}
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
                  disabled={(page + 1) * rowsPerPage >= userSubscriptions.length}
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
