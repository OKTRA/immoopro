
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Receipt, Calendar, ArrowDownUp } from "lucide-react";
import { PaymentData } from "@/services/payment/types";
import PaymentsList from "@/components/payments/PaymentsList";
import PaymentBulkManager from "@/components/payments/PaymentBulkManager";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PaymentsTabsSectionProps {
  payments: PaymentData[];
  leaseId: string;
  rentAmount: number;
  selectedPaymentIds: string[];
  onAddPayment: () => void;
  onEditPayment: (payment: PaymentData) => void;
  onDeletePayment: (paymentId: string) => void;
  onPaymentSelect: (paymentId: string, selected: boolean) => void;
  onRefreshData: () => void;
}

export default function PaymentsTabsSection({
  payments,
  leaseId,
  rentAmount,
  selectedPaymentIds,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
  onPaymentSelect,
  onRefreshData
}: PaymentsTabsSectionProps) {
  const [activeTab, setActiveTab] = useState('list');
  
  // Filter and sort payments to create transaction history
  const transactionHistory = [...payments]
    .filter(payment => payment.paymentDate !== null) // Only include payments that have been made
    .sort((a, b) => {
      // Sort by payment date (most recent first)
      const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
      const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
      return dateB - dateA;
    });
  
  return (
    <>
      {/* Bulk Payment Manager */}
      <PaymentBulkManager
        leaseId={leaseId}
        initialRentAmount={rentAmount || 0}
        onPaymentsGenerated={onRefreshData}
        onPaymentsUpdated={onRefreshData}
        selectedPaymentIds={selectedPaymentIds}
      />
      
      {/* Payments tabs */}
      <Tabs 
        defaultValue="list" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="list">
            <Receipt className="h-4 w-4 mr-2" /> Liste des paiements
          </TabsTrigger>
          <TabsTrigger value="history">
            <DollarSign className="h-4 w-4 mr-2" /> Historique des transactions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <PaymentsList 
            payments={payments}
            onAddPayment={onAddPayment}
            onEditPayment={onEditPayment}
            onDeletePayment={onDeletePayment}
            selectedPaymentIds={selectedPaymentIds}
            onPaymentSelect={onPaymentSelect}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardContent className="p-6">
              {transactionHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date de paiement</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Méthode</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactionHistory.map((payment) => (
                        <TableRow key={`history-${payment.id}`}>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={payment.paymentType === 'rent' ? 'default' : 'secondary'}>
                              {payment.paymentType === 'rent' ? 'Loyer' : 
                                payment.paymentType === 'deposit' ? 'Caution' :
                                payment.paymentType === 'agency_fee' ? 'Frais d\'agence' : 
                                'Autre'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <ArrowDownUp className="h-4 w-4 mr-2 text-green-500" />
                              {formatCurrency(payment.amount, 'FCFA')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {payment.paymentMethod === 'bank_transfer' ? 'Virement bancaire' : 
                              payment.paymentMethod === 'cash' ? 'Espèces' :
                              payment.paymentMethod === 'check' ? 'Chèque' :
                              payment.paymentMethod === 'mobile_money' ? 'Mobile Money' : 
                              payment.paymentMethod}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {payment.notes || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Aucune transaction</h3>
                  <p className="text-muted-foreground mt-2">
                    Les paiements effectués apparaîtront ici comme un historique des transactions.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
