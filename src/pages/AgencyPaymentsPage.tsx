
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, CreditCard, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            <div>
              <CardTitle className="text-xl">Vue d'ensemble des paiements</CardTitle>
              <CardDescription>
                Gérez les paiements de toutes vos propriétés depuis un seul endroit
              </CardDescription>
            </div>
            <CreditCard className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Aperçu</TabsTrigger>
                <TabsTrigger value="bulkManagement">Gestion en masse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun paiement récent</h3>
                  <p className="text-muted-foreground max-w-md">
                    Les paiements de toutes vos propriétés apparaîtront ici. Vous pouvez accéder aux paiements d'une propriété spécifique depuis sa page détaillée.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="bulkManagement">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                      Fonctionnalité de gestion en masse activée
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Vous pouvez désormais sélectionner plusieurs paiements dans les pages de bail et les mettre à jour en une seule opération. 
                      Cela est particulièrement utile pour mettre à jour les paiements au statut "indéfini".
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="font-medium mb-2 flex items-center text-blue-800">
                      <Clock className="h-5 w-5 mr-2 text-blue-600" />
                      Comment utiliser la mise à jour en masse
                    </h3>
                    <ol className="list-decimal pl-5 text-sm text-blue-700 space-y-1">
                      <li>Accédez à la page de gestion des paiements d'un bail</li>
                      <li>Sélectionnez les paiements à mettre à jour en cochant les cases</li>
                      <li>Utilisez le panneau "Mise à jour en masse" pour changer leur statut</li>
                      <li>Cliquez sur "Mettre à jour" pour appliquer les changements</li>
                    </ol>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
