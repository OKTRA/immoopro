
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PaymentsTableHeaderProps {
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  showSelectionColumn: boolean;
}

export default function PaymentsTableHeader({ 
  sortField, 
  sortDirection, 
  onSort,
  showSelectionColumn
}: PaymentsTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        {showSelectionColumn && (
          <TableHead style={{ width: 40 }}>
            <span className="sr-only">Sélection</span>
          </TableHead>
        )}
        <TableHead 
          className="cursor-pointer"
          onClick={() => onSort("dueDate")}
        >
          Échéance {sortField === "dueDate" && (sortDirection === "asc" ? "↑" : "↓")}
        </TableHead>
        <TableHead>Type</TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => onSort("amount")}
        >
          Montant {sortField === "amount" && (sortDirection === "asc" ? "↑" : "↓")}
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => onSort("effectiveStatus")}
        >
          Statut {sortField === "effectiveStatus" && (sortDirection === "asc" ? "↑" : "↓")}
        </TableHead>
        <TableHead>Date de paiement</TableHead>
        <TableHead>Notes</TableHead>
        <TableHead style={{ width: 40 }}>
          <span className="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
