import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  PlusCircle,
  Search,
  Calendar,
  Download,
  FileText,
  Filter,
  CreditCard,
  Building2
} from 'lucide-react';

interface BillingHistoryItem {
  id: string;
  subscription_id: string;
  amount: number;
  billing_date: string;
  payment_method: string;
  status: string;
  invoice_url?: string;
  created_at: string;
  // Nouveaux champs ajoutés
  user_id?: string;
  agency_id?: string;
  plan_id?: string;
  description?: string;
  transaction_id?: string;
  payment_date?: string;
  
  // Relations
  agencies?: {
    name: string;
    logoUrl?: string;
  };
  subscription_plans?: {
    name: string;
    billing_cycle: string;
  };
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

export default function BillingHistoryManager() {
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<BillingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<BillingHistoryItem | null>(null);

  // Périodes pour le filtre
  const periods = [
    { value: 'all', label: 'Toutes les périodes' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'thisWeek', label: 'Cette semaine' },
    { value: 'thisMonth', label: 'Ce mois' },
    { value: 'lastMonth', label: 'Mois dernier' },
    { value: 'thisYear', label: 'Cette année' }
  ];

  useEffect(() => {
    fetchBillingHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [billingHistory, searchTerm, selectedStatus, selectedPeriod]);

  const fetchBillingHistory = async () => {
    setLoading(true);
    try {
      // Vérifier d'abord les relations disponibles pour éviter les erreurs
      const { data: billing, error: billingError } = await supabase
        .from('billing_history')
        .select('*')
        .limit(1);
        
      if (billingError) {
        toast.error(`Erreur lors du chargement de l'historique: ${billingError.message}`);
        return;
      }

      // Adaptez la requête en fonction des colonnes disponibles
      const { data, error } = await supabase
        .from('billing_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error(`Erreur lors du chargement de l'historique: ${error.message}`);
        return;
      }

      // Enrichir les données si nécessaire
      const enrichedData = await Promise.all((data || []).map(async (item) => {
        let enrichedItem = { ...item };
        
        // Récupérer les informations sur l'abonnement
        if (item.subscription_id) {
          const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('*, subscription_plans:plan_id(*)')
            .eq('id', item.subscription_id)
            .single();
            
          if (subscription) {
            enrichedItem.user_id = subscription.user_id;
            enrichedItem.agency_id = subscription.agency_id;
            enrichedItem.plan_id = subscription.plan_id;
            enrichedItem.subscription_plans = subscription.subscription_plans;
            
            // Récupérer les informations sur l'utilisateur si disponible
            if (subscription.user_id) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', subscription.user_id)
                .single();
                
              if (profile) {
                enrichedItem.profiles = profile;
              }
            }
            
            // Récupérer les informations sur l'agence si disponible
            if (subscription.agency_id) {
              const { data: agency } = await supabase
                .from('agencies')
                .select('*')
                .eq('id', subscription.agency_id)
                .single();
                
              if (agency) {
                enrichedItem.agencies = agency;
              }
            }
          }
        }
        
        // Ajouter une description si elle n'existe pas
        if (!enrichedItem.description) {
          const planName = enrichedItem.subscription_plans?.name || 'Abonnement';
          const userName = enrichedItem.profiles ? 
            `${enrichedItem.profiles.first_name || ''} ${enrichedItem.profiles.last_name || ''}`.trim() : 
            'Utilisateur';
          const agencyName = enrichedItem.agencies?.name || '';
          
          enrichedItem.description = `${planName} pour ${userName}${agencyName ? ` (Agence: ${agencyName})` : ''}`;
        }
        
        return enrichedItem;
      }));

      setBillingHistory(enrichedData || []);
      
      // Calculer le revenu total
      const total = enrichedData.reduce((sum, item) => {
        if (item.status === 'completed') {
          return sum + (item.amount || 0);
        }
        return sum;
      }, 0);
      setTotalRevenue(total);
    } catch (error) {
      console.error('Error fetching billing history:', error);
      toast.error('Échec du chargement de l\'historique des paiements');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...billingHistory];

    // Filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.transaction_id && item.transaction_id.toLowerCase().includes(term)) ||
        (item.agency?.name && item.agency.name.toLowerCase().includes(term))
      );
    }

    // Filtre par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Filtre par période
    if (selectedPeriod !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const thisYearStart = new Date(now.getFullYear(), 0, 1);

      filtered = filtered.filter(item => {
        const itemDate = new Date(item.payment_date || item.created_at);
        
        switch (selectedPeriod) {
          case 'today':
            return itemDate >= today;
          case 'thisWeek':
            return itemDate >= thisWeekStart;
          case 'thisMonth':
            return itemDate >= thisMonthStart;
          case 'lastMonth':
            return itemDate >= lastMonthStart && itemDate <= lastMonthEnd;
          case 'thisYear':
            return itemDate >= thisYearStart;
          default:
            return true;
        }
      });
    }

    setFilteredHistory(filtered);
  };

  const handleViewReceipt = (transaction: BillingHistoryItem) => {
    setSelectedTransaction(transaction);
    setOpenReceiptDialog(true);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Complété</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">En attente</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Échoué</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Remboursé</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Historique des paiements</CardTitle>
              <CardDescription>
                Suivez tous les paiements d'abonnements des agences
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 font-medium">
                Revenu Total: {formatAmount(totalRevenue)}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fetchBillingHistory()}
                className="ml-2"
              >
                <CreditCard className="mr-1 h-4 w-4" /> Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-auto flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="completed">Complété</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="failed">Échoué</SelectItem>
                  <SelectItem value="refunded">Remboursé</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={selectedPeriod}
                onValueChange={setSelectedPeriod}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin mr-2">
                <PlusCircle className="h-6 w-6 opacity-50" />
              </div>
              <span>Chargement des transactions...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune transaction trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Agence</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(transaction.payment_date || transaction.billing_date || transaction.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {transaction.agencies?.name || 
                             (transaction.profiles ? 
                              `${transaction.profiles.first_name || ''} ${transaction.profiles.last_name || ''}`.trim() : 
                              'Agent inconnu')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{transaction.description}</span>
                        {transaction.transaction_id && (
                          <div className="text-xs text-muted-foreground mt-1">
                            ID: {transaction.transaction_id}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReceipt(transaction)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            <span>Reçu</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour afficher le reçu */}
      <Dialog open={openReceiptDialog} onOpenChange={setOpenReceiptDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails de la transaction</DialogTitle>
            <DialogDescription>
              Informations détaillées sur cette transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4 my-3">
              <div className="border rounded-lg p-5 space-y-4 bg-card/50">
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="font-bold text-lg">Reçu</div>
                  <Badge className="px-3 py-1">
                    {selectedTransaction.status === 'completed' ? 'PAYÉ' : selectedTransaction.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="font-medium">Transaction ID</div>
                  <div>{selectedTransaction.transaction_id || 'N/A'}</div>
                  
                  <div className="font-medium">Date</div>
                  <div>{formatDate(selectedTransaction.payment_date || selectedTransaction.created_at)}</div>
                  
                  <div className="font-medium">Agence</div>
                  <div>{selectedTransaction.agency?.name || 'N/A'}</div>
                  
                  <div className="font-medium">Plan</div>
                  <div>{selectedTransaction.subscription_plan?.name || 'N/A'}</div>
                  
                  <div className="font-medium">Cycle de facturation</div>
                  <div className="capitalize">{selectedTransaction.subscription_plan?.billing_cycle || 'N/A'}</div>
                  
                  <div className="font-medium">Méthode de paiement</div>
                  <div className="capitalize">{selectedTransaction.payment_method || 'N/A'}</div>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center font-medium">
                    <span>Description</span>
                    <span>Montant</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm">{selectedTransaction.description}</span>
                    <span className="font-bold">{formatAmount(selectedTransaction.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpenReceiptDialog(false)}
            >
              Fermer
            </Button>
            <Button
              variant="default"
              onClick={() => {
                // Ici on pourrait ajouter une fonctionnalité pour télécharger le reçu en PDF
                toast.success('Cette fonctionnalité sera bientôt disponible');
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
