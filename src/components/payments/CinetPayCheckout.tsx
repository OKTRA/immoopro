
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { initCinetPayPayment, checkCinetPayPaymentStatus } from '@/services/payment/cinetpayService';
import { useToast } from '@/components/ui/use-toast';

interface CinetPayCheckoutProps {
  amount: number;
  description: string;
  leaseId?: string;
  onSuccess?: (transactionId: string) => void;
  onCancel?: () => void;
  paymentData?: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  };
}

export default function CinetPayCheckout({
  amount,
  description,
  leaseId,
  onSuccess,
  onCancel,
  paymentData
}: CinetPayCheckoutProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  
  // Function to initialize payment
  const handleInitPayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the current origin for return URLs
      const origin = window.location.origin;
      
      const { data, error } = await initCinetPayPayment({
        amount,
        description,
        returnUrl: `${origin}/payment/success`,
        cancelUrl: `${origin}/payment/cancel`,
        leaseId,
        paymentData
      });
      
      if (error || !data) {
        setError(error || 'Une erreur est survenue lors de l\'initialisation du paiement.');
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'initialiser le paiement CinetPay."
        });
        return;
      }
      
      // Check if payment URL was returned
      if (data.data && data.data.payment_url) {
        setPaymentUrl(data.data.payment_url);
        setTransactionId(data.data.transaction_id || data.data.cpm_trans_id);
        setShowIframe(true);
      } else {
        setError('Aucune URL de paiement n\'a été reçue de CinetPay.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to check payment status
  const checkPaymentStatus = async () => {
    if (!transactionId) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await checkCinetPayPaymentStatus({
        transactionId
      });
      
      if (error || !data) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de vérifier le statut du paiement."
        });
        return;
      }
      
      // Check payment status
      if (data.code === '00' && data.data.status === 'ACCEPTED') {
        setPaymentStatus('success');
        toast({
          title: "Paiement réussi",
          description: "Votre paiement a été traité avec succès."
        });
        
        if (onSuccess) {
          onSuccess(transactionId);
        }
      } else {
        setPaymentStatus('failed');
        setError(data.message || 'Le paiement n\'a pas été accepté.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle iframe close
  const handleCloseIframe = () => {
    setShowIframe(false);
    
    // Check if we need to verify the payment status
    if (transactionId) {
      checkPaymentStatus();
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    setShowIframe(false);
    if (onCancel) {
      onCancel();
    }
  };
  
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Paiement avec CinetPay</CardTitle>
          <CardDescription>
            Payer en toute sécurité via Mobile Money ou carte bancaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 p-3 rounded-md mb-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
              <div className="text-sm text-destructive">{error}</div>
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div className="bg-green-100 p-3 rounded-md mb-4 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <div className="text-sm text-green-600">Paiement effectué avec succès!</div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-muted-foreground">Montant</span>
              <span className="font-medium">{amount.toLocaleString()} FCFA</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-muted-foreground">Description</span>
              <span className="font-medium">{description}</span>
            </div>
            
            {paymentData?.customerName && (
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-muted-foreground">Client</span>
                <span className="font-medium">{paymentData.customerName}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          {!paymentStatus && (
            <Button 
              onClick={handleInitPayment} 
              disabled={loading || !!paymentStatus}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Procéder au paiement
                </>
              )}
            </Button>
          )}
          
          {paymentStatus === 'success' && (
            <Button variant="outline" onClick={handleCancel}>
              Fermer
            </Button>
          )}
          
          {paymentStatus === 'failed' && (
            <Button variant="outline" onClick={() => setPaymentStatus(null)}>
              Réessayer
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Dialog open={showIframe} onOpenChange={setShowIframe}>
        <DialogContent className="sm:max-w-[600px] h-[80vh]">
          <DialogHeader>
            <DialogTitle>Paiement CinetPay</DialogTitle>
            <DialogDescription>
              Complétez votre paiement en suivant les instructions ci-dessous.
            </DialogDescription>
          </DialogHeader>
          
          {paymentUrl && (
            <iframe
              src={paymentUrl}
              width="100%"
              height="100%"
              style={{ border: 'none', minHeight: '400px' }}
              onLoad={handleCloseIframe}
            />
          )}
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handleCloseIframe}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
