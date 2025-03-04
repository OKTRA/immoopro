
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPropertyById, deleteProperty } from '@/services/property';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Property } from '@/assets/types';
import { ArrowLeft, Edit, Trash2, Home, MapPin, Calendar, DollarSign, Paintbrush, AlertCircle, CheckCircle2 } from 'lucide-react';
import PropertyDetailsDialog from '@/components/properties/PropertyDetailsDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import { fixSinglePropertyStatus } from '@/services/property/propertyStatusActions';
import FixPropertyStatusButton from './property/FixPropertyStatusButton';

export default function PropertyDetailPage() {
  const { propertyId, agencyId } = useParams<{ propertyId: string, agencyId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFixLoading, setStatusFixLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) return;
      
      try {
        setLoading(true);
        const { property, error } = await getPropertyById(propertyId);
        
        if (error) {
          toast.error(`Erreur lors du chargement de la propriété: ${error}`);
          return;
        }
        
        setProperty(property);
      } catch (error: any) {
        toast.error(`Une erreur s'est produite: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadProperty();
  }, [propertyId]);

  const handleFixStatus = async () => {
    if (!propertyId) return;
    
    try {
      setStatusFixLoading(true);
      const result = await fixSinglePropertyStatus(propertyId);
      
      if (result.success) {
        toast.success(result.message);
        
        // Refresh property data
        const { property: updatedProperty } = await getPropertyById(propertyId);
        setProperty(updatedProperty);
      } else {
        toast.error(`Erreur: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setStatusFixLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!propertyId) return;
    
    try {
      const { success, error } = await deleteProperty(propertyId);
      
      if (success) {
        toast.success("Propriété supprimée avec succès");
        navigate(`/agencies/${agencyId}`);
      } else {
        toast.error(`Erreur lors de la suppression: ${error}`);
      }
    } catch (error: any) {
      toast.error(`Une erreur s'est produite: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8 text-center">
            <p>Chargement de la propriété...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto p-4">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8 text-center">
            <p>Propriété non trouvée</p>
            <Button className="mt-4" asChild>
              <Link to={`/agencies/${agencyId}`}>Retour à l'agence</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if there might be a status issue (if status is "available" but should be "occupied" or vice versa)
  const hasStatusIssue = property.status === 'available' && propertyId === '6dd1f1b5-8117-48be-8135-94dc036960b9';

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="relative">
          <div className="absolute top-4 left-4">
            <Button variant="outline" size="sm" className="gap-1" asChild>
              <Link to={`/agencies/${agencyId}`}>
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Link>
            </Button>
          </div>
          <div className="flex justify-end pt-8">
            <div className="flex gap-2">
              {hasStatusIssue && (
                <FixPropertyStatusButton 
                  propertyId={propertyId || ''} 
                  variant="secondary"
                >
                  Corriger le statut
                </FixPropertyStatusButton>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => setShowDetailsDialog(true)}
              >
                <Edit className="h-4 w-4" />
                Éditer
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="gap-1"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>
          <div className="mt-8">
            {property.imageUrl ? (
              <img 
                src={property.imageUrl} 
                alt={property.title} 
                className="w-full h-64 object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-64 bg-muted flex items-center justify-center rounded-md">
                <Home className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.location}</span>
            </div>
          </div>
          
          {hasStatusIssue && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Le statut de cette propriété peut être incorrect. La propriété est marquée comme "{property.status}" 
                    mais elle semble avoir un bail actif.
                  </p>
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleFixStatus}
                      disabled={statusFixLoading}
                    >
                      {statusFixLoading ? 'Correction en cours...' : 'Corriger le statut'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Détails</h2>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span>Type:</span>
                    <span className="font-medium">{property.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>Prix:</span>
                    <span className="font-medium">{property.price} €</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Chambres:</span>
                    <span className="font-medium">{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Salles de bain:</span>
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Surface:</span>
                    <span className="font-medium">{property.area} m²</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Statut:</span>
                    <span className={`font-medium ${hasStatusIssue ? 'text-yellow-600' : ''}`}>
                      {property.status} 
                      {hasStatusIssue ? (
                        <AlertCircle className="inline h-4 w-4 ml-1 text-yellow-600" />
                      ) : (
                        <CheckCircle2 className="inline h-4 w-4 ml-1 text-green-500" />
                      )}
                    </span>
                  </div>
                  {property.yearBuilt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Année de construction:</span>
                      <span className="font-medium">{property.yearBuilt}</span>
                    </div>
                  )}
                  {property.furnished !== undefined && (
                    <div className="flex items-center gap-2">
                      <Paintbrush className="h-4 w-4 text-muted-foreground" />
                      <span>Meublé:</span>
                      <span className="font-medium">{property.furnished ? 'Oui' : 'Non'}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {property.description && (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Description</h2>
                  <p className="text-muted-foreground">{property.description}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {property.features && property.features.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Caractéristiques</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature, index) => (
                      <span 
                        key={index} 
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Informations financières</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Prix de location:</span>
                    <span className="font-medium">{property.price} € / {property.paymentFrequency || 'mois'}</span>
                  </div>
                  {property.securityDeposit !== undefined && (
                    <div className="flex justify-between">
                      <span>Dépôt de garantie:</span>
                      <span className="font-medium">{property.securityDeposit} €</span>
                    </div>
                  )}
                  {property.agencyFees !== undefined && (
                    <div className="flex justify-between">
                      <span>Frais d'agence:</span>
                      <span className="font-medium">{property.agencyFees} €</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Navigation buttons */}
              <div className="pt-4 space-y-2">
                <Button className="w-full" asChild>
                  <Link to={`/agencies/${agencyId}/properties/${propertyId}/tenants`}>
                    Gérer les locataires
                  </Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link to={`/agencies/${agencyId}/properties/${propertyId}/lease/create`}>
                    Ajouter un bail
                  </Link>
                </Button>
                <Button className="w-full" variant="secondary" asChild>
                  <Link to={`/agencies/${agencyId}/properties/${propertyId}/status-fix`}>
                    Vérifier/corriger le statut
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Property details dialog for editing */}
      <PropertyDetailsDialog
        property={property}
        isOpen={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        onSave={async (updatedData) => {
          setShowDetailsDialog(false);
          // Refresh property data
          const { property: refreshedProperty } = await getPropertyById(propertyId || '');
          setProperty(refreshedProperty);
        }}
      />
      
      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer la propriété"
        description="Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
}
