
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentData } from "@/services/payment";
import { useLeasePayments } from "@/hooks/useLeasePayments";
import LeaseHeader from "@/components/payments/lease/LeaseHeader";
import LeaseInfoSection from "@/components/payments/lease/LeaseInfoSection";
import PaymentsTabsSection from "@/components/payments/lease/PaymentsTabsSection";
import PaymentsSummary from "@/components/payments/PaymentsSummary";
import PaymentFormDialog from "@/components/payments/lease/PaymentFormDialog";

export default function PropertyLeasePaymentsPage() {
  const { agencyId, propertyId, leaseId } = useParams<{ agencyId: string; propertyId: string; leaseId: string }>();
  const navigate = useNavigate();
  
  const {
    lease,
    payments,
    stats,
    loading,
    submitting,
    selectedPaymentIds,
    fetchData,
    handleAddPayment,
    handleUpdatePayment,
    handleDeletePayment,
    handlePaymentSelect
  } = useLeasePayments(leaseId);
  
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<PaymentData | null>(null);
  
  const handleAddPaymentClick = () => {
    setCurrentPayment(null);
    setShowAddPaymentDialog(true);
  };
  
  const handleEditPaymentClick = (payment: PaymentData) => {
    setCurrentPayment(payment);
    setShowAddPaymentDialog(true);
  };
  
  const handleSubmitPayment = async (data: PaymentData) => {
    try {
      if (currentPayment?.id) {
        // Update existing payment
        const success = await handleUpdatePayment(currentPayment.id, data);
        if (success) {
          setShowAddPaymentDialog(false);
        }
      } else {
        // Create new payment
        const success = await handleAddPayment(data);
        if (success) {
          setShowAddPaymentDialog(false);
        }
      }
    } catch (error) {
      console.error("Error handling payment submit:", error);
    }
  };
  
  const handleGoBack = () => {
    navigate(`/agencies/${agencyId}/properties/${propertyId}`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <div className="text-2xl font-bold">Chargement...</div>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  if (!lease) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <div className="text-2xl font-bold text-red-500">Bail non trouvé</div>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleGoBack}>
              Retour à la propriété
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <LeaseHeader lease={lease} onBack={handleGoBack} />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Lease & tenant information */}
          <LeaseInfoSection lease={lease} />
          
          {/* Payment summary */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Résumé des paiements</h3>
            <PaymentsSummary stats={stats} />
          </div>
          
          {/* Payments tabs and bulk manager */}
          <PaymentsTabsSection
            payments={payments}
            leaseId={leaseId!}
            rentAmount={lease.monthly_rent || 0}
            selectedPaymentIds={selectedPaymentIds}
            onAddPayment={handleAddPaymentClick}
            onEditPayment={handleEditPaymentClick}
            onDeletePayment={handleDeletePayment}
            onPaymentSelect={handlePaymentSelect}
            onRefreshData={fetchData}
          />
        </CardContent>
      </Card>
      
      {/* Payment dialog */}
      <PaymentFormDialog
        isOpen={showAddPaymentDialog}
        onOpenChange={setShowAddPaymentDialog}
        leaseId={leaseId!}
        monthlyRent={lease.monthly_rent}
        currentPayment={currentPayment}
        onSubmit={handleSubmitPayment}
        isSubmitting={submitting}
      />
    </div>
  );
}
