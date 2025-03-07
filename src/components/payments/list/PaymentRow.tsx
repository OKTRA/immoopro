
import React, { useState } from 'react';
import { MoreHorizontal, Check, X, Calendar, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { getStatusIcon, getPaymentTypeBadge } from "../utils/paymentDisplayUtils";
import { formatCurrency } from "@/lib/utils";
import { PaymentData } from "@/services/payment/types";

interface PaymentRowProps {
  payment: PaymentData;
  onEditPayment: (payment: PaymentData) => void;
  onDeletePayment: (paymentId: string) => void;
  showSelectionColumn?: boolean;
  isSelected?: boolean;
  onPaymentSelect?: (paymentId: string, selected: boolean) => void;
}

export default function PaymentRow({
  payment,
  onEditPayment,
  onDeletePayment,
  showSelectionColumn = false,
  isSelected = false,
  onPaymentSelect
}: PaymentRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleToggleSelect = (checked: boolean) => {
    if (payment.id && onPaymentSelect) {
      onPaymentSelect(payment.id, checked);
    }
  };
  
  const handleDeletePayment = () => {
    if (payment.id && window.confirm("Êtes-vous sûr de vouloir supprimer ce paiement?")) {
      onDeletePayment(payment.id);
    }
  };
  
  // Determine the status to display
  const displayStatus = payment.effectiveStatus || payment.status || "undefined";
  
  return (
    <TableRow 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={isSelected ? "bg-muted/50" : (isHovered ? "bg-muted/20" : "")}
    >
      {showSelectionColumn && (
        <TableCell className="w-10">
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={handleToggleSelect}
          />
        </TableCell>
      )}
      <TableCell>
        {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "-"}
      </TableCell>
      <TableCell>
        {payment.paymentType ? getPaymentTypeBadge(payment.paymentType) : "-"}
      </TableCell>
      <TableCell className="font-medium">
        {formatCurrency(payment.amount)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {getStatusIcon(displayStatus)}
          <span className="capitalize ml-1">{displayStatus}</span>
        </div>
      </TableCell>
      <TableCell>
        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "-"}
      </TableCell>
      <TableCell className="max-w-xs truncate">
        {payment.notes || "-"}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditPayment(payment)}>
              <FileEdit className="mr-2 h-4 w-4" />
              <span>Modifier</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeletePayment}>
              <X className="mr-2 h-4 w-4" />
              <span>Supprimer</span>
            </DropdownMenuItem>
            {displayStatus !== "paid" && (
              <DropdownMenuItem onClick={() => onEditPayment({...payment, status: 'paid'})}>
                <Check className="mr-2 h-4 w-4" />
                <span>Marquer comme payé</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
