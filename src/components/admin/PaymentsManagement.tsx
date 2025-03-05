
import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Search, Filter, Download, CreditCard, CheckCircle, AlertCircle, Clock, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CinetPayCheckout from '@/components/payments/CinetPayCheckout';

export default function PaymentsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  
  // Mock data for payments
  const payments = [
    { 
      id: '1', 
      propertyId: 'P001',
      propertyName: 'Appartement Haussmannien',
      tenant: 'Jean Dupont',
      amount: 950,
      date: '15/03/2023',
      dueDate: '10/03/2023',
      type: 'rent',
      status: 'paid',
      method: 'card'
    },
    { 
      id: '2', 
      propertyId: 'P002',
      propertyName: 'Studio Centre-Ville',
      tenant: 'Marie Lambert',
      amount: 1200,
      date: '12/03/2023',
      dueDate: '10/03/2023',
      type: 'rent',
      status: 'paid',
      method: 'bank_transfer'
    },
    { 
      id: '3', 
      propertyId: 'P003',
      propertyName: 'Villa Provence',
      tenant: 'Pierre Martin',
      amount: 550,
      date: null,
      dueDate: '05/04/2023',
      type: 'deposit',
      status: 'pending',
      method: 'bank_transfer'
    },
    { 
      id: '4', 
      propertyId: 'P004',
      propertyName: 'Loft Industriel',
      tenant: 'Sophie Leclerc',
      amount: 1500,
      date: null,
      dueDate: '15/03/2023',
      type: 'rent',
      status: 'late',
      method: null
    },
    { 
      id: '5', 
      propertyId: 'P005',
      propertyName: 'Duplex Moderne',
      tenant: 'Thomas Dubois',
      amount: 750,
      date: '20/03/2023',
      dueDate: '10/03/2023',
      type: 'agency_fee',
      status: 'paid',
      method: 'card'
    },
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'late':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 mr-1.5" />;
      case 'pending':
        return <Clock className="h-4 w-4 mr-1.5" />;
      case 'late':
        return <AlertCircle className="h-4 w-4 mr-1.5" />;
      default:
        return null;
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'rent':
        return 'Loyer';
      case 'deposit':
        return 'Caution';
      case 'agency_fee':
        return 'Frais d\'agence';
      default:
        return 'Autre';
    }
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return '-';
    
    switch (method) {
      case 'card':
        return 'Carte bancaire';
      case 'bank_transfer':
        return 'Virement bancaire';
      default:
        return method;
    }
  };

  // Filter payments based on search term and filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      payment.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.propertyId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatusFilter = statusFilter === 'all' || payment.status === statusFilter;
    const matchesTypeFilter = typeFilter === 'all' || payment.type === typeFilter;
    
    return matchesSearch && matchesStatusFilter && matchesTypeFilter;
  });

  // Handle payment success
  const handlePaymentSuccess = (transactionId: string) => {
    setShowPaymentDialog(false);
    // Refresh payments list logic would go here
  };

  // Handle new payment
  const handleNewPayment = (payment: any) => {
    setSelectedPayment(payment);
    setShowPaymentDialog(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestion des Paiements</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => setShowPaymentDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Paiement
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un paiement..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="late">En retard</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="rent">Loyer</SelectItem>
                <SelectItem value="deposit">Caution</SelectItem>
                <SelectItem value="agency_fee">Frais d'agence</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Paiements</CardTitle>
          <CardDescription>
            Gérez tous les paiements de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Propriété</TableHead>
                  <TableHead>Propriété</TableHead>
                  <TableHead>Locataire</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date d'échéance</TableHead>
                  <TableHead>Date paiement</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.propertyId}</TableCell>
                    <TableCell className="font-medium">{payment.propertyName}</TableCell>
                    <TableCell>{payment.tenant}</TableCell>
                    <TableCell>{payment.amount} €</TableCell>
                    <TableCell>{getPaymentTypeLabel(payment.type)}</TableCell>
                    <TableCell>{payment.dueDate}</TableCell>
                    <TableCell>{payment.date || '-'}</TableCell>
                    <TableCell>{getPaymentMethodLabel(payment.method)}</TableCell>
                    <TableCell>
                      <div className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        getStatusBadgeClass(payment.status)
                      )}>
                        {getStatusIcon(payment.status)}
                        {payment.status === 'paid' && 'Payé'}
                        {payment.status === 'pending' && 'En attente'}
                        {payment.status === 'late' && 'En retard'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status !== 'paid' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleNewPayment(payment)}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Payer
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={<CreditCard className="h-10 w-10 text-muted-foreground" />}
              title="Aucun paiement trouvé"
              description="Aucun paiement ne correspond à vos critères de recherche."
              action={
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}>
                  Réinitialiser les filtres
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      {/* CinetPay Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Paiement avec CinetPay</DialogTitle>
          <DialogDescription>
            {selectedPayment 
              ? `Paiement pour ${selectedPayment.propertyName}`
              : 'Nouveau paiement'
            }
          </DialogDescription>
          
          <CinetPayCheckout 
            amount={selectedPayment ? selectedPayment.amount : 1000}
            description={selectedPayment 
              ? `Paiement pour ${selectedPayment.propertyName}`
              : 'Nouveau paiement'
            }
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentDialog(false)}
            paymentData={{
              customerName: selectedPayment?.tenant || 'Client',
              customerEmail: 'client@example.com',
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
