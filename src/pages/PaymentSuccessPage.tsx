
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { checkCinetPayPaymentStatus } from '@/services/payment/cinetpayService';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
  // Get transaction ID from URL parameters
  const transactionId = searchParams.get('transaction_id') || searchParams.get('cpm_trans_id');
  
  useEffect(() => {
    // If no transaction ID is found, redirect to home
    if (!transactionId) {
      navigate('/');
      return;
    }
    
    // Check payment status
    const verifyPayment = async () => {
      try {
        setChecking(true);
        
        // Call the service to check payment status
        const { data, error } = await checkCinetPayPaymentStatus({
          transactionId
        });
        
        if (error || !data) {
          console.error('Error checking payment status:', error);
          setPaymentStatus('failed');
          return;
        }
        
        // Parse response from CinetPay
        if (data.code === '00' && data.data.status === 'ACCEPTED') {
          setPaymentStatus('success');
          setPaymentDetails(data.data);
        } else {
          setPaymentStatus('failed');
          setPaymentDetails(data);
        }
      } catch (err) {
        console.error('Error in payment verification:', err);
        setPaymentStatus('failed');
      } finally {
        setChecking(false);
      }
    };
    
    verifyPayment();
  }, [transactionId, navigate]);
  
  const handleGoHome = () => {
    navigate('/');
  };
  
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };
  
  // Show loading while checking payment status
  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-md mx-auto p-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>Vérification du Paiement</CardTitle>
            <CardDescription>Nous vérifions le statut de votre paiement...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              Veuillez patienter pendant que nous vérifions votre paiement.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-md mx-auto p-4">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Résultat du Paiement</CardTitle>
          <CardDescription>
            {paymentStatus === 'success' 
              ? 'Votre paiement a été traité avec succès' 
              : 'Un problème est survenu lors du traitement de votre paiement'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {paymentStatus === 'success' ? (
            <>
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-600 mb-2">Paiement Réussi</h2>
              <p className="text-center text-muted-foreground mb-4">
                Votre paiement a été traité avec succès. Merci pour votre confiance!
              </p>
              {paymentDetails && (
                <div className="w-full bg-muted/50 p-4 rounded-md mb-4 text-sm">
                  <p><strong>Référence:</strong> {paymentDetails.payment_token || transactionId}</p>
                  <p><strong>Montant:</strong> {paymentDetails.amount || '-'} {paymentDetails.currency || 'XOF'}</p>
                  <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="bg-red-100 p-4 rounded-full mb-4">
                <AlertTriangle className="h-16 w-16 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-red-600 mb-2">Échec du Paiement</h2>
              <p className="text-center text-muted-foreground mb-4">
                Nous n'avons pas pu traiter votre paiement. Veuillez réessayer ou contacter notre service client.
              </p>
              {paymentDetails && (
                <div className="w-full bg-muted/50 p-4 rounded-md mb-4 text-sm">
                  <p><strong>Référence:</strong> {transactionId}</p>
                  <p><strong>Erreur:</strong> {paymentDetails.message || paymentDetails.data?.message || 'Erreur inconnue'}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-3">
          <Button onClick={handleGoHome} variant="outline">
            Retour à l'accueil
          </Button>
          {paymentStatus === 'success' && (
            <Button onClick={handleGoToDashboard}>
              Voir mes paiements
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
