
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, CreditCard, Receipt } from "lucide-react";

interface PaymentStats {
  totalPaid: number;
  totalDue: number;
  pendingPayments: number;
  latePayments: number;
  balance: number;
}

interface PaymentsSummaryProps {
  stats: PaymentStats;
}

export default function PaymentsSummary({ stats }: PaymentsSummaryProps) {
  const { totalPaid, totalDue, pendingPayments, latePayments, balance } = stats;
  
  const getBalanceColor = () => {
    if (balance > 0) return "text-red-500";
    return "text-green-500";
  };
  
  const getBalanceIcon = () => {
    if (balance > 0) return <ArrowUp className="h-5 w-5 text-red-500" />;
    return <ArrowDown className="h-5 w-5 text-green-500" />;
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Total payé</CardTitle>
            <CardDescription>Montant total reçu</CardDescription>
          </div>
          <Receipt className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPaid.toLocaleString()} FCFA</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Total dû</CardTitle>
            <CardDescription>Montant total attendu</CardDescription>
          </div>
          <CreditCard className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDue.toLocaleString()} FCFA</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <CardDescription>Montant restant à payer</CardDescription>
          </div>
          {getBalanceIcon()}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getBalanceColor()}`}>
            {Math.abs(balance).toLocaleString()} FCFA
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {balance > 0 ? 'À payer' : 'Crédit'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Statut des paiements</CardTitle>
            <CardDescription>Paiements en attente/retard</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div>
              <span className="text-yellow-500 font-medium">{pendingPayments}</span>
              <span className="text-xs text-muted-foreground"> en attente</span>
            </div>
            <div>
              <span className="text-red-500 font-medium">{latePayments}</span>
              <span className="text-xs text-muted-foreground"> en retard</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
