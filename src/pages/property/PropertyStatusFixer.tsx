
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getPropertyById } from '@/services/property';
import { getLeasesByPropertyId, fixPropertyStatus, syncAllPropertiesStatus } from '@/services/tenant/leaseService';
import { Property } from '@/assets/types';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function PropertyStatusFixer() {
  const { propertyId, agencyId } = useParams<{ propertyId: string, agencyId: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [batchFixing, setBatchFixing] = useState(false);
  const [hasIssue, setHasIssue] = useState(false);
  const [fixResult, setFixResult] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!propertyId) return;
      
      try {
        setLoading(true);
        
        const { property } = await getPropertyById(propertyId);
        setProperty(property);
        
        const { leases } = await getLeasesByPropertyId(propertyId);
        setLeases(leases || []);
        
        // Check if there's an issue with property status
        const activeLeases = leases?.filter(lease => lease.is_active === true) || [];
        const expectedStatus = activeLeases.length > 0 ? 'occupied' : 'available';
        
        setHasIssue(property?.status !== expectedStatus);
      } catch (error) {
        console.error('Error fetching property data:', error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [propertyId]);

  const handleFixStatus = async () => {
    if (!propertyId) return;
    
    try {
      setFixing(true);
      const result = await fixPropertyStatus(propertyId);
      setFixResult(result);
      
      if (result.success) {
        toast.success(result.message);
        // Refresh property data
        const { property: updatedProperty } = await getPropertyById(propertyId);
        setProperty(updatedProperty);
        setHasIssue(false);
      } else {
        toast.error(`Erreur: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error fixing property status:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setFixing(false);
    }
  };

  const handleBatchFix = async () => {
    if (!agencyId) {
      toast.error("ID d'agence non disponible");
      return;
    }
    
    try {
      setBatchFixing(true);
      const result = await syncAllPropertiesStatus(agencyId);
      
      if (result.success) {
        toast.success(`${result.updated} propriétés mises à jour sur ${result.total}`);
        
        // Refresh property data if our current property was updated
        if (propertyId) {
          const { property: updatedProperty } = await getPropertyById(propertyId);
          setProperty(updatedProperty);
          
          const affectedProperty = result.details?.find((item: any) => item.propertyId === propertyId);
          if (affectedProperty?.updated) {
            setHasIssue(false);
          }
        }
      } else {
        toast.error(`Erreur: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error batch fixing property statuses:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setBatchFixing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vérification du statut de la propriété</CardTitle>
          <CardDescription>Chargement des données...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statut de la propriété</CardTitle>
        <CardDescription>
          Vérification et correction du statut de la propriété en fonction des baux actifs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {property ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Propriété</p>
                <p className="text-lg">{property.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Statut actuel</p>
                <div className="flex items-center gap-2">
                  <p className={`text-lg ${hasIssue ? 'text-red-500' : 'text-green-500'}`}>
                    {property.status}
                  </p>
                  {hasIssue ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Baux associés ({leases.length})</p>
              {leases.length > 0 ? (
                <div className="space-y-2">
                  {leases.map((lease) => (
                    <div key={lease.id} className="border p-2 rounded-md text-sm">
                      <div className="flex justify-between">
                        <span>Locataire: {lease.tenants?.first_name} {lease.tenants?.last_name}</span>
                        <span className={`font-medium ${lease.is_active ? 'text-green-500' : 'text-gray-500'}`}>
                          {lease.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs">
                        ID du bail: {lease.id}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucun bail associé à cette propriété</p>
              )}
            </div>
            
            {hasIssue && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Incohérence détectée</AlertTitle>
                <AlertDescription>
                  La propriété a {leases.filter(l => l.is_active).length} bail(s) actif(s) mais son statut est "{property.status}". 
                  Le statut correct devrait être "{leases.filter(l => l.is_active).length > 0 ? 'occupied' : 'available'}".
                </AlertDescription>
              </Alert>
            )}
            
            {fixResult && (
              <Alert variant={fixResult.success ? "default" : "destructive"} className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Résultat de la correction</AlertTitle>
                <AlertDescription>
                  {fixResult.message || fixResult.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <p>Propriété non trouvée</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBatchFix}
          disabled={batchFixing}
        >
          {batchFixing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Correction en cours...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Corriger toutes les propriétés
            </>
          )}
        </Button>
        <Button 
          onClick={handleFixStatus} 
          disabled={fixing || !hasIssue}
        >
          {fixing ? 'Correction en cours...' : 'Corriger le statut'}
        </Button>
      </CardFooter>
    </Card>
  );
}
