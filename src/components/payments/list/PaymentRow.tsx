
import { 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { PaymentData } from "@/services/payment/types";
import { getStatusIcon, getPaymentTypeBadge } from "../utils/paymentDisplayUtils";
import { formatCurrency, getPaymentStatusLabel } from "@/lib/utils";

interface PaymentRowProps {
  payment: PaymentData & { effectiveStatus: string };
  onEditPayment: (payment: PaymentData) => void;
  onDeletePayment: (paymentId: string) => void;
  showSelectionColumn: boolean;
  isSelected: boolean;
  onPaymentSelect?: (paymentId: string, selected: boolean) => void;
}

export default function PaymentRow({
  payment,
  onEditPayment,
  onDeletePayment,
  showSelectionColumn,
  isSelected,
  onPaymentSelect
}: PaymentRowProps) {
  return (
    <TableRow key={payment.id}>
      {showSelectionColumn && onPaymentSelect && (
        <TableCell>
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={(e) => onPaymentSelect(payment.id || '', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
        </TableCell>
      )}
      <TableCell>
        {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "N/A"}
      </TableCell>
      <TableCell>
        {getPaymentTypeBadge(payment.paymentType)}
      </TableCell>
      <TableCell className="font-medium">
        {formatCurrency(payment.amount)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {getStatusIcon(payment.effectiveStatus)}
          <span className="capitalize">{getPaymentStatusLabel(payment.effectiveStatus)}</span>
        </div>
      </TableCell>
      <TableCell>
        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "—"}
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        {payment.notes || "—"}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditPayment(payment)}>
              <Edit className="h-4 w-4 mr-2" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDeletePayment(payment.id || '')}>
              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
