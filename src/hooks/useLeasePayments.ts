import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  PaymentData,
  getLeaseWithPayments,
  getLeasePaymentStats,
  createPayment,
  updatePayment,
  deletePayment,
} from "@/services/payment";
import { generateInitialPayments } from "@/services/payment/paymentGeneration";

export const useLeasePayments = (leaseId: string | undefined) => {
  const { toast } = useToast();

  const [lease, setLease] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalDue: 0,
    pendingPayments: 0,
    latePayments: 0,
    advancedPayments: 0,
    undefinedPayments: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);

  const fetchData = async () => {
    if (!leaseId) return;

    setLoading(true);
    try {
      console.log("Fetching lease data for leaseId:", leaseId);

      // Fetch lease data with payments
      const {
        lease: leaseData,
        payments: paymentsData,
        error,
      } = await getLeaseWithPayments(leaseId);
      if (error) {
        console.error("Error fetching lease with payments:", error);
        throw new Error(error);
      }

      console.log("Lease data received:", leaseData);
      console.log(
        "Payments data received:",
        paymentsData?.length || 0,
        "payments",
      );

      setLease(leaseData);
      setPayments(paymentsData || []);

      // If no payments exist yet, generate initial payments (deposit, agency fee)
      if (paymentsData?.length === 0) {
        console.log("No payments found, generating initial payments...");
        const initialResult = await generateInitialPayments(leaseId, leaseData);
        if (initialResult.error) {
          console.error(
            "Error generating initial payments:",
            initialResult.error,
          );
        } else if (initialResult.paymentsGenerated > 0) {
          console.log(
            "Generated initial payments:",
            initialResult.paymentsGenerated,
          );
          // Refresh data to show the new payments
          const refreshResult = await getLeaseWithPayments(leaseId);
          if (!refreshResult.error) {
            setPayments(refreshResult.payments || []);
          }
        }
      }

      // Fetch payment stats
      const { stats: paymentStats, error: statsError } =
        await getLeasePaymentStats(leaseId);
      if (statsError) {
        console.error("Error fetching payment stats:", statsError);
        throw new Error(statsError);
      }

      console.log("Payment stats received:", paymentStats);
      setStats(paymentStats);
    } catch (error: any) {
      console.error("Error in fetchData:", error);
      toast({
        title: "Erreur",
        description: `Impossible de récupérer les données: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [leaseId]);

  const handleAddPayment = async (data: PaymentData) => {
    setSubmitting(true);
    try {
      // Create new payment
      const result = await createPayment({
        ...data,
        leaseId: leaseId!,
      });
      if (result.error) throw new Error(result.error);

      toast({
        title: "Paiement ajouté",
        description: "Le paiement a été ajouté avec succès.",
      });

      // Refresh data
      fetchData();
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'ajouter le paiement: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePayment = async (paymentId: string, data: PaymentData) => {
    setSubmitting(true);
    try {
      // Update existing payment
      const result = await updatePayment(paymentId, data);
      if (result.error) throw new Error(result.error);

      toast({
        title: "Paiement mis à jour",
        description: "Le paiement a été mis à jour avec succès.",
      });

      // Refresh data
      fetchData();
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour le paiement: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce paiement?"))
      return false;

    try {
      const { success, error } = await deletePayment(paymentId);
      if (error) throw new Error(error);

      toast({
        title: "Paiement supprimé",
        description: "Le paiement a été supprimé avec succès.",
      });

      // Refresh data
      fetchData();
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le paiement: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const handlePaymentSelect = (paymentId: string, selected: boolean) => {
    if (selected) {
      setSelectedPaymentIds((prev) => [...prev, paymentId]);
    } else {
      setSelectedPaymentIds((prev) => prev.filter((id) => id !== paymentId));
    }
  };

  const clearSelectedPayments = () => {
    setSelectedPaymentIds([]);
  };

  return {
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
    handlePaymentSelect,
    clearSelectedPayments,
  };
};
