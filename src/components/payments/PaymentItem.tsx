
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ArrowDown, 
  ArrowUp, 
  Calendar, 
  Check, 
  CreditCard,
  Receipt, 
  X 
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentData } from '@/services/paymentService';

interface PaymentItemProps {
  payment: PaymentData;
  onEdit?: (payment: PaymentData) => void;
  onDelete?: (paymentId: string) => void;
}

export default function PaymentItem({ payment, onEdit, onDelete }: PaymentItemProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <Check className="h-3 w-3 mr-1" /> Payé
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
            <Calendar className="h-3 w-3 mr-1" /> En attente
          </Badge>
        );
      case 'late':
        return (
          <Badge variant="destructive">
            <ArrowDown className="h-3 w-3 mr-1" /> En retard
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" /> Annulé
          </Badge>
        );
      case 'undefined':
        return (
          <Badge variant="secondary">
            Indéfini
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-600">Espèces</Badge>;
      case 'bank_transfer':
        return <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-600">Virement</Badge>;
      case 'mobile_money':
        return <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-600">Mobile Money</Badge>;
      case 'check':
        return <Badge variant="outline" className="bg-teal-50 border-teal-200 text-teal-600">Chèque</Badge>;
      case 'card':
        return <Badge variant="outline" className="bg-indigo-50 border-indigo-200 text-indigo-600">
          <CreditCard className="h-3 w-3 mr-1" /> Carte
        </Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  return (
    <Card className="mb-3 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 gap-3">
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <Receipt className="h-5 w-5 mr-2 text-primary" />
              <span className="font-semibold text-lg">{payment.amount.toLocaleString()} FCFA</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Payé le {formatDate(payment.paymentDate || '')}
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {getStatusBadge(payment.status)}
            {getPaymentMethodIcon(payment.paymentMethod)}
            
            {payment.transactionId && (
              <div className="text-xs text-muted-foreground">
                Ref: {payment.transactionId}
              </div>
            )}
          </div>
          
          {(onEdit || onDelete) && (
            <div className="flex space-x-2 mt-2 md:mt-0">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEdit(payment)}
                >
                  Modifier
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(payment.id!)}
                >
                  Supprimer
                </Button>
              )}
            </div>
          )}
        </div>
        
        {payment.notes && (
          <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t">
            <p className="mt-2">{payment.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
