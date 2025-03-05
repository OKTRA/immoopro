
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { checkCinetPayPaymentStatus } from '@/services/payment/cinetpayService';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Extract transaction ID from URL
  const transactionId = searchParams.get('transaction_id') || searchParams.get('cpm_trans_id');
  
  useEffect(() => {
    if (!transactionId) {
      setLoading(false);
      setError('ID de transaction manquant dans l\'URL.');
      return;
    }
    
    const verifyPayment = async () => {
      try {
        const { data, error } = await checkCinetPayPaymentStatus({
          transactionId
        });
        
        if (error || !data) {
          setError(error || 'Une erreur est survenue lors de la vérification du paiement.');
          return;
        }
        
        // Check payment status
        if (data.code === '00' && data.data.status === 'ACCEPTED') {
          setSuccess(true);
        } else {
          setError(data.message || 'Le paiement n\'a pas été accepté.');
        }
      } catch (err: any) {
        setError(err.message || 'Une erreur inattendue est survenue.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyPayment();
  }, [transactionId]);
  
  const handleNavigateToPayments = () => {
    navigate('/payments');
  };
  
  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Statut du Paiement</CardTitle>
          <CardDescription>
            Vérification de votre paiement
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          {loading ? (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Vérification du paiement en cours...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Veuillez patienter pendant que nous vérifions le statut de votre paiement.
              </p>
            </>
          ) : success ? (
            <>
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-600 mb-2">Paiement Réussi!</h2>
              <p className="text-center text-muted-foreground mb-4">
                Votre paiement a été traité avec succès. Vous pouvez maintenant accéder à votre contenu.
              </p>
              <div className="bg-muted p-4 rounded-md w-full">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Transaction ID:</span>
                  <span className="text-sm font-medium">{transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-red-100 p-4 rounded-full mb-4">
                <AlertCircle className="h-16 w-16 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-red-600 mb-2">Échec du Paiement</h2>
              <p className="text-center text-muted-foreground mb-4">
                {error || 'Une erreur est survenue lors du traitement de votre paiement.'}
              </p>
              <p className="text-sm text-muted-foreground">
                Veuillez réessayer ou contacter notre service client pour obtenir de l'aide.
              </p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleNavigateToPayments}>
            Retour aux Paiements
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
