
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, CreditCard } from "lucide-react";

export default function AgencyPaymentsPage() {
  const { agencyId } = useParams();

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion des paiements</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Vue d'ensemble des paiements</CardTitle>
            <CreditCard className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun paiement récent</h3>
              <p className="text-muted-foreground max-w-md">
                Les paiements de toutes vos propriétés apparaîtront ici. Vous pouvez accéder aux paiements d'une propriété spécifique depuis sa page détaillée.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
