
import { CheckCircle2, Clock, AlertTriangle, ArrowUpRight, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "paid":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "late":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "advanced":
      return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
    default:
      return <HelpCircle className="h-4 w-4 text-gray-400" />;
  }
};

export const getPaymentTypeBadge = (type: string) => {
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

export const getPaymentTypeLabel = (type: string) => {
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
