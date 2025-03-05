
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const navigate = useNavigate();
  
  const handleNavigateToPayments = () => {
    navigate('/admin/payments');
  };
  
  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Paiement Annulé</CardTitle>
          <CardDescription>
            Vous avez annulé la procédure de paiement
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="bg-amber-100 p-4 rounded-full mb-4">
            <AlertCircle className="h-16 w-16 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-amber-600 mb-2">Paiement Annulé</h2>
          <p className="text-center text-muted-foreground mb-4">
            Vous avez annulé le processus de paiement. Aucune somme n'a été prélevée sur votre compte.
          </p>
          <p className="text-sm text-muted-foreground">
            Vous pouvez réessayer à tout moment ou contacter notre service client pour obtenir de l'aide.
          </p>
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
