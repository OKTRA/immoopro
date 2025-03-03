
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import PaymentForm from "@/components/payments/PaymentForm";
import PaymentsList from "@/components/payments/PaymentsList";
import PaymentsSummary from "@/components/payments/PaymentsSummary";
import { PaymentData, createPayment, deletePayment, getLeaseWithPayments, getLeasePaymentStats, updatePayment } from "@/services/paymentService";
import { ArrowLeft, Building, DollarSign, Receipt, User } from "lucide-react";

export default function PropertyLeasePaymentsPage() {
  const { agencyId, propertyId, leaseId } = useParams<{ agencyId: string; propertyId: string; leaseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lease, setLease] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalDue: 0,
    pendingPayments: 0,
    latePayments: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<PaymentData | null>(null);
  
  useEffect(() => {
    if (!leaseId) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch lease data with payments
        const { lease, payments, error } = await getLeaseWithPayments(leaseId);
        if (error) throw new Error(error);
        
        setLease(lease);
        setPayments(payments || []);
        
        // Fetch payment stats
        const { stats: paymentStats, error: statsError } = await getLeasePaymentStats(leaseId);
        if (statsError) throw new Error(statsError);
        
        setStats(paymentStats);
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: `Impossible de récupérer les données: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [leaseId, toast]);
  
  const handleAddPayment = () => {
    setCurrentPayment(null);
    setShowAddPaymentDialog(true);
  };
  
  const handleEditPayment = (payment: PaymentData) => {
    setCurrentPayment(payment);
    setShowAddPaymentDialog(true);
  };
  
  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce paiement?")) return;
    
    try {
      const { success, error } = await deletePayment(paymentId);
      if (error) throw new Error(error);
      
      toast({
        title: "Paiement supprimé",
        description: "Le paiement a été supprimé avec succès."
      });
      
      // Refresh data
      const { lease, payments } = await getLeaseWithPayments(leaseId!);
      setPayments(payments || []);
      
      const { stats: paymentStats } = await getLeasePaymentStats(leaseId!);
      setStats(paymentStats);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le paiement: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  const handleSubmitPayment = async (data: PaymentData) => {
    setSubmitting(true);
    try {
      if (currentPayment?.id) {
        // Update existing payment
        const { payment, error } = await updatePayment(currentPayment.id, data);
        if (error) throw new Error(error);
        
        toast({
          title: "Paiement mis à jour",
          description: "Le paiement a été mis à jour avec succès."
        });
      } else {
        // Create new payment
        const { payment, error } = await createPayment({
          ...data,
          lease_id: leaseId!
        });
        if (error) throw new Error(error);
        
        toast({
          title: "Paiement ajouté",
          description: "Le paiement a été ajouté avec succès."
        });
      }
      
      // Refresh data
      const { lease, payments } = await getLeaseWithPayments(leaseId!);
      setPayments(payments || []);
      
      const { stats: paymentStats } = await getLeasePaymentStats(leaseId!);
      setStats(paymentStats);
      
      setShowAddPaymentDialog(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer le paiement: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Chargement...</CardTitle>
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
            <CardTitle className="text-2xl font-bold text-red-500">Bail non trouvé</CardTitle>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate(`/agencies/${agencyId}/properties/${propertyId}`)}>
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Gestion des paiements</CardTitle>
              <CardDescription>
                Bail pour la propriété "{lease.properties.title}"
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/agencies/${agencyId}/properties/${propertyId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la propriété
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Lease & tenant information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-semibold">Informations sur le bail</h3>
              </div>
              <div className="text-sm grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Début:</span>
                <span>{new Date(lease.start_date).toLocaleDateString()}</span>
                
                <span className="text-muted-foreground">Fin:</span>
                <span>{new Date(lease.end_date).toLocaleDateString()}</span>
                
                <span className="text-muted-foreground">Loyer mensuel:</span>
                <span className="font-medium">{lease.monthly_rent?.toLocaleString()} FCFA</span>
                
                <span className="text-muted-foreground">Caution:</span>
                <span>{lease.security_deposit?.toLocaleString()} FCFA</span>
                
                <span className="text-muted-foreground">Statut:</span>
                <span className="capitalize">{lease.status}</span>
              </div>
            </div>
            
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-semibold">Informations sur le locataire</h3>
              </div>
              <div className="text-sm grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Nom:</span>
                <span>{lease.tenants?.first_name} {lease.tenants?.last_name}</span>
                
                <span className="text-muted-foreground">Email:</span>
                <span>{lease.tenants?.email}</span>
                
                <span className="text-muted-foreground">Téléphone:</span>
                <span>{lease.tenants?.phone}</span>
              </div>
            </div>
          </div>
          
          {/* Payment summary */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Résumé des paiements</h3>
            <PaymentsSummary stats={stats} />
          </div>
          
          {/* Payments tabs */}
          <Tabs defaultValue="list" className="space-y-4">
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
                onAddPayment={handleAddPayment}
                onEditPayment={handleEditPayment}
                onDeletePayment={handleDeletePayment}
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
        </CardContent>
      </Card>
      
      {/* Payment dialog */}
      <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentPayment ? 'Modifier le paiement' : 'Ajouter un paiement'}
            </DialogTitle>
            <DialogDescription>
              {currentPayment 
                ? 'Modifiez les détails du paiement ci-dessous.'
                : 'Entrez les détails du paiement ci-dessous.'}
            </DialogDescription>
          </DialogHeader>
          
          <PaymentForm
            leaseId={leaseId!}
            monthlyRent={lease.monthly_rent}
            onSubmit={handleSubmitPayment}
            onCancel={() => setShowAddPaymentDialog(false)}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
