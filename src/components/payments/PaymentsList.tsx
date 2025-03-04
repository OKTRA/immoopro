
import { useState } from "react";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PaymentData } from "@/services/payment";
import { Edit, MoreVertical, Plus, Trash2, AlertTriangle, CheckCircle2, Clock, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface PaymentsListProps {
  payments: PaymentData[];
  onAddPayment: () => void;
  onEditPayment: (payment: PaymentData) => void;
  onDeletePayment: (paymentId: string) => void;
  selectedPaymentIds?: string[];
  onPaymentSelect?: (paymentId: string, selected: boolean) => void;
}

export default function PaymentsList({ 
  payments,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
  selectedPaymentIds = [],
  onPaymentSelect
}: PaymentsListProps) {
  const [sortField, setSortField] = useState<string>("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const sortedPayments = [...payments].sort((a, b) => {
    let aValue = a[sortField as keyof PaymentData];
    let bValue = b[sortField as keyof PaymentData];
    
    if (aValue === null || aValue === undefined) aValue = "";
    if (bValue === null || bValue === undefined) bValue = "";
    
    if (sortDirection === "asc") {
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    } else {
      if (aValue > bValue) return -1;
      if (aValue < bValue) return 1;
      return 0;
    }
  });
  
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "late":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Caution";
      case "agency_fee":
        return "Frais d'agence";
      case "rent":
        return "Loyer";
      case "deposit_return":
        return "Remboursement caution";
      case "initial":
        return "Initial";
      default:
        return "Autre";
    }
  };
  
  const getPaymentTypeBadge = (type: string) => {
    switch (type) {
      case "deposit":
        return <Badge variant="secondary">Caution</Badge>;
      case "agency_fee":
        return <Badge variant="secondary">Frais d'agence</Badge>;
      case "rent":
        return <Badge variant="default">Loyer</Badge>;
      case "deposit_return":
        return <Badge variant="outline">Remboursement caution</Badge>;
      case "initial":
        return <Badge variant="secondary">Initial</Badge>;
      default:
        return <Badge variant="outline">Autre</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liste des paiements</CardTitle>
          <CardDescription>
            {payments.length} paiement{payments.length !== 1 ? "s" : ""} au total
            {selectedPaymentIds.length > 0 && ` (${selectedPaymentIds.length} sélectionné${selectedPaymentIds.length > 1 ? 's' : ''})`}
          </CardDescription>
        </div>
        <Button onClick={onAddPayment}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter un paiement
        </Button>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Aucun paiement enregistré. Cliquez sur "Ajouter un paiement" pour commencer.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {onPaymentSelect && (
                  <TableHead style={{ width: 40 }}>
                    <span className="sr-only">Sélection</span>
                  </TableHead>
                )}
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("dueDate")}
                >
                  Échéance {sortField === "dueDate" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("amount")}
                >
                  Montant {sortField === "amount" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Statut {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Date de paiement</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead style={{ width: 40 }}>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  {onPaymentSelect && (
                    <TableCell>
                      <input 
                        type="checkbox" 
                        checked={selectedPaymentIds.includes(payment.id || '')}
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
                      {getStatusIcon(payment.status)}
                      <span className="capitalize">{payment.status}</span>
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
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
