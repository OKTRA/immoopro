
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Clock, AlertCircle, CheckCircle, HelpCircle, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentsSummaryProps {
  stats: {
    totalPaid: number;
    totalDue: number;
    pendingPayments: number;
    latePayments: number;
    advancedPayments?: number;
    undefinedPayments?: number;
    balance: number;
  };
}

export default function PaymentsSummary({ stats }: PaymentsSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Total versé</p>
            <p className="text-xl font-bold">{formatCurrency(stats.totalPaid, "FCFA")}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-500" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">En cours</p>
            <p className="text-xl font-bold">{stats.pendingPayments || 0}</p>
          </div>
          <Clock className="h-8 w-8 text-yellow-500" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">En retard</p>
            <p className="text-xl font-bold">{stats.latePayments || 0}</p>
          </div>
          <AlertCircle className="h-8 w-8 text-red-500" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">En avance</p>
            <p className="text-xl font-bold">{stats.advancedPayments || 0}</p>
          </div>
          <ArrowUpRight className="h-8 w-8 text-blue-500" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">À définir</p>
            <p className="text-xl font-bold">{stats.undefinedPayments || 0}</p>
          </div>
          <HelpCircle className="h-8 w-8 text-gray-500" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Solde</p>
            <p className="text-xl font-bold">{formatCurrency(stats.balance, "FCFA")}</p>
          </div>
          <DollarSign className="h-8 w-8 text-blue-500" />
        </CardContent>
      </Card>
    </div>
  );
}
