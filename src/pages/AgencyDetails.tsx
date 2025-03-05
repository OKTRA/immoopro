import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import AgencyHeader from '@/components/agency/AgencyHeader';
import PropertiesTable from '@/components/property/PropertiesTable';
import { useQuery } from '@tanstack/react-query';
import { getAgencyById } from '@/services/agency';

export default function AgencyDetailPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [agency, setAgency] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: agencyData } = useQuery({
    queryKey: ['agency', agencyId],
    queryFn: () => getAgencyById(agencyId || ''),
    enabled: !!agencyId
  });

  useEffect(() => {
    if (agencyData?.agency) {
      setAgency(agencyData.agency);
    }
  }, [agencyData]);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        // Fetch properties related to the agency
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('agency_id', agencyId);

        if (error) {
          throw error;
        }

        setProperties(data || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error("Erreur lors du chargement des propriétés");
      } finally {
        setIsLoading(false);
      }
    };

    if (agencyId) {
      fetchProperties();
    }
  }, [agencyId]);

  const handleCreateProperty = () => {
    navigate(`/agencies/${agencyId}/properties/create`);
  };

  return (
    <>
      <Navbar />
      <AgencyHeader />
      <div className="container mx-auto py-16 px-4">
        <Tabs defaultvalue="properties" className="w-full space-y-4">
          <TabsList>
            <TabsTrigger value="properties">Propriétés</TabsTrigger>
            <TabsTrigger value="tenants">Locataires</TabsTrigger>
            <TabsTrigger value="leases">Baux</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>
          <TabsContent value="properties" className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold mb-4">Liste des propriétés</h1>
              <Button onClick={handleCreateProperty}>Ajouter une propriété</Button>
            </div>
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <PropertiesTable properties={properties} agencyId={agencyId || ''} />
            )}
          </TabsContent>
          <TabsContent value="tenants">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des locataires</CardTitle>
                <CardDescription>Fonctionnalité en cours de développement</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Cette section est en cours de développement. Revenez plus tard !
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="leases">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des baux</CardTitle>
                <CardDescription>Fonctionnalité en cours de développement</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Cette section est en cours de développement. Revenez plus tard !
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des paiements</CardTitle>
                <CardDescription>Fonctionnalité en cours de développement</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Cette section est en cours de développement. Revenez plus tard !
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de l'agence</CardTitle>
                <CardDescription>Fonctionnalité en cours de développement</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Cette section est en cours de développement. Revenez plus tard !
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
}
