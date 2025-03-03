
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircleIcon, RefreshCw, RotateCcw, Loader2, Calendar, RefreshCcw } from "lucide-react";
import { PaymentData, generateHistoricalPayments, updateBulkPayments } from "@/services/paymentService";

interface PaymentBulkManagerProps {
  leaseId: string;
  payments: PaymentData[];
  paymentStartDate: string;
  paymentFrequency: string;
  monthlyRent: number;
  onPaymentsUpdated: () => void;
}

export default function PaymentBulkManager({
  leaseId,
  payments,
  paymentStartDate,
  paymentFrequency,
  monthlyRent,
  onPaymentsUpdated
}: PaymentBulkManagerProps) {
  const { toast } = useToast();
  const [selectedPayments, setSelectedPayments] = useState<Record<string, boolean>>({});
  const [bulkStatus, setBulkStatus] = useState<'completed' | 'pending' | 'late' | 'undefined'>('completed');
  const [bulkNotes, setBulkNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleSelectAll = () => {
    const newSelected: Record<string, boolean> = {};
    
    // Select only undefined and pending payments
    payments.forEach(payment => {
      if (payment.status === 'undefined' || payment.status === 'pending') {
        newSelected[payment.id || ''] = true;
      }
    });
    
    setSelectedPayments(newSelected);
  };

  const handleClearSelection = () => {
    setSelectedPayments({});
  };

  const handleGenerateHistorical = async () => {
    if (!paymentStartDate) {
      toast({
        title: "Erreur",
        description: "Date de début des paiements non définie",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      const { success, message, paymentsCreated, error } = await generateHistoricalPayments(
        leaseId,
        paymentStartDate,
        paymentFrequency,
        monthlyRent
      );

      if (error) throw new Error(error);

      if (success) {
        toast({
          title: paymentsCreated > 0 ? "Paiements générés avec succès" : "Aucun nouveau paiement nécessaire",
          description: message
        });
        
        if (paymentsCreated > 0) {
          // Refresh the payments list
          onPaymentsUpdated();
        }
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de générer les paiements: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleBulkUpdate = async () => {
    const selectedIds = Object.entries(selectedPayments)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    if (selectedIds.length === 0) {
      toast({
        title: "Avertissement",
        description: "Aucun paiement sélectionné",
        variant: "destructive"
      });
      return;
    }

    setUpdating(true);
    try {
      const { success, updatedCount, error } = await updateBulkPayments(
        selectedIds,
        bulkStatus,
        bulkNotes || `Mis à jour en masse vers ${bulkStatus}`,
        undefined // processedBy - could be added if we add user context
      );

      if (error) throw new Error(error);

      if (success) {
        toast({
          title: "Paiements mis à jour",
          description: `${updatedCount} paiements ont été mis à jour vers "${getStatusLabel(bulkStatus)}"`
        });
        
        // Clear selection and refresh
        setSelectedPayments({});
        onPaymentsUpdated();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour les paiements: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'completed': return 'Payé';
      case 'pending': return 'En attente';
      case 'late': return 'En retard';
      case 'failed': return 'Échoué';
      case 'undefined': return 'À définir';
      default: return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'late': return 'bg-red-500';
      case 'failed': return 'bg-red-700';
      case 'undefined': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const undefinedCount = payments.filter(p => p.status === 'undefined').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const selectedCount = Object.values(selectedPayments).filter(isSelected => isSelected).length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Gestion des paiements</span>
          <Badge variant="outline" className="ml-2 text-xs">
            {payments.length} paiements
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Historique des paiements et génération */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Génération des paiements historiques</h3>
            <p className="text-xs text-muted-foreground">
              Générez automatiquement tous les paiements attendus depuis 
              le {new Date(paymentStartDate).toLocaleDateString()} jusqu'à aujourd'hui.
            </p>
            <Button 
              variant="outline" 
              onClick={handleGenerateHistorical}
              disabled={generating}
              className="w-full"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Générer l'historique des paiements
            </Button>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">État des paiements</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-xs">À définir:</span>
                <Badge variant="secondary">{undefinedCount}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-xs">En attente:</span>
                <Badge variant="secondary">{pendingCount}</Badge>
              </div>
            </div>
          </div>
        </div>
        
        {undefinedCount > 0 && (
          <Alert>
            <CheckCircleIcon className="h-4 w-4" />
            <AlertTitle>Paiements historiques détectés</AlertTitle>
            <AlertDescription>
              Vous avez {undefinedCount} paiements à statut indéfini. Utilisez les actions en masse ci-dessous pour les mettre à jour.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Mise à jour en masse */}
        <div className="border rounded-md p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Actions en masse</h3>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSelectAll}
                disabled={updating}
              >
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Tout sélectionner
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearSelection}
                disabled={updating}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Réinitialiser
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Nouveau statut</label>
              <Select 
                value={bulkStatus} 
                onValueChange={(value) => setBulkStatus(value as any)}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Payé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="late">En retard</SelectItem>
                  <SelectItem value="undefined">À définir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium">
                Notes (optionnel)
              </label>
              <Textarea 
                value={bulkNotes} 
                onChange={(e) => setBulkNotes(e.target.value)}
                placeholder="Notes sur cette mise à jour en masse..."
                disabled={updating}
                className="h-10"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {selectedCount} paiements sélectionnés
            </p>
            <Button 
              onClick={handleBulkUpdate}
              disabled={selectedCount === 0 || updating}
            >
              {updating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Mettre à jour {selectedCount} paiements
            </Button>
          </div>
        </div>
        
        {/* Liste des paiements pour sélection */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-3">Sélectionner des paiements</h3>
          <div className="border rounded-md divide-y max-h-80 overflow-y-auto">
            {payments
              .sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime())
              .map(payment => (
                <div 
                  key={payment.id} 
                  className={`flex items-center py-2 px-3 hover:bg-muted/50 ${
                    payment.status === 'undefined' ? 'bg-gray-50' : ''
                  }`}
                >
                  <Checkbox
                    checked={selectedPayments[payment.id || ''] || false}
                    onCheckedChange={(checked) => {
                      setSelectedPayments(prev => ({
                        ...prev,
                        [payment.id || '']: !!checked
                      }));
                    }}
                    disabled={updating}
                    className="mr-3"
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {payment.payment_type === 'initial' ? 'Paiement initial' : 'Loyer'} - {payment.amount.toLocaleString()} FCFA
                      </div>
                    </div>
                    <Badge 
                      variant="outline"
                      className={`${getStatusColor(payment.status)} text-white`}
                    >
                      {getStatusLabel(payment.status)}
                    </Badge>
                  </div>
                </div>
              ))}
              
            {payments.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <p>Aucun paiement trouvé</p>
                <p className="text-xs mt-1">Générez d'abord l'historique des paiements</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center border-t pt-4">
        <Button 
          variant="outline" 
          onClick={onPaymentsUpdated}
          className="w-full"
          disabled={generating || updating}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Actualiser les données
        </Button>
      </CardFooter>
    </Card>
  );
}
