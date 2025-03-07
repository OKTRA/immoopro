
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Receipt } from "lucide-react";
import { PaymentData } from "@/services/payment/types";
import PaymentsList from "@/components/payments/PaymentsList";
import PaymentBulkManager from "@/components/payments/PaymentBulkManager";

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
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Historique des transactions</h3>
                <p className="text-muted-foreground mt-2">
                  Cette fonctionnalité sera disponible prochainement.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
