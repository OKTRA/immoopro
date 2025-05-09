import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnalyticsSummaryCards } from "./AnalyticsSummaryCards";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts";
import { Loader2, TrendingUp, InfoIcon, Users, Building, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AgencyReportExport from "./AgencyReportExport";
import { toast } from "sonner";

// Les données seront chargées depuis Supabase au lieu d'utiliser des données mockées

// Définir les couleurs pour les graphiques
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];

interface AgencyMetric {
  id: string;
  name: string;
  properties: number;
  agents: number;
  rating: number;
  performance?: number;
  revenue?: number;
}

interface MonthlyActivity {
  month: string;
  activity: number;
  listings?: number;
  visits?: number;
}

export default function AgencyPerformanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [agencies, setAgencies] = useState<AgencyMetric[]>([]);
  const [agentActivity, setAgentActivity] = useState<MonthlyActivity[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fonction pour rafraîchir les données
  const refreshData = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    await fetchAgencyData();
    toast.success("Données mises à jour");
    setRefreshing(false);
  };
  
  const fetchAgencyData = async () => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      // Récupérer les données des agences
      const { data: agenciesData, error: agenciesError } = await supabase
        .from('agencies')
        .select(`
          id, 
          name, 
          created_at,
          profiles(count),
          properties(count)
        `);
        
      if (agenciesError) throw agenciesError;
      
      // Récupérer les données des propriétés
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, agency_id, status, price');
        
      if (propertiesError) throw propertiesError;
      
      // Organiser les propriétés par agence
      const propertiesByAgency: Record<string, any[]> = {};
      propertiesData.forEach(property => {
        if (!property.agency_id) return;
        
        if (!propertiesByAgency[property.agency_id]) {
          propertiesByAgency[property.agency_id] = [];
        }
        
        propertiesByAgency[property.agency_id].push(property);
      });
      
      // Préparer les données des agences pour l'affichage
      const formattedAgencies = agenciesData.map(agency => {
        const agencyProperties = propertiesByAgency[agency.id] || [];
        const totalValue = agencyProperties.reduce((sum, p) => sum + (p.price || 0), 0);
        
        // Calcul d'un score de performance basé sur le nombre de propriétés et leur valeur
        const propertyCount = agencyProperties.length;
        const avgPropertyValue = propertyCount > 0 ? totalValue / propertyCount : 0;
        const performanceScore = propertyCount * (avgPropertyValue > 0 ? Math.log10(avgPropertyValue) : 1) / 10;
        
        return {
          id: agency.id,
          name: agency.name,
          properties: propertyCount,
          agents: agency.profiles ? agency.profiles.length : 0,
          rating: 4.0 + (Math.random() * 1 - 0.5), // Valeur simulée en attendant l'implémentation des avis
          performance: parseFloat(performanceScore.toFixed(1)),
          revenue: totalValue
        };
      }).sort((a, b) => b.properties - a.properties); // Trier par nombre de propriétés
      
      setAgencies(formattedAgencies);
      
      // Générer des données d'activité mensuelles
      const currentDate = new Date();
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const activityData: MonthlyActivity[] = [];
      
      // Pour chaque mois dans les 6 derniers mois
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentDate.getMonth() - i) % 12;
        const positiveMonthIndex = monthIndex >= 0 ? monthIndex : monthIndex + 12;
        
        // Générer des données d'activité simulées basées sur le nombre total de propriétés
        // Dans une implémentation réelle, ces données viendraient de la base de données
        const totalProps = agencies.reduce((sum, a) => sum + a.properties, 0);
        const baseActivity = Math.max(5, Math.floor(totalProps * 0.8));
        const randomFactor = 0.5 + Math.random();
        
        activityData.push({
          month: monthNames[positiveMonthIndex],
          activity: Math.floor(baseActivity * randomFactor),
          listings: Math.floor(baseActivity * randomFactor * 0.6),
          visits: Math.floor(baseActivity * randomFactor * 2.2)
        });
      }
      
      setAgentActivity(activityData);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données des agences:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAgencyData();
  }, []);
  
  // Calcul des métriques de résumé
  const totalProperties = agencies.reduce((sum, a) => sum + a.properties, 0);
  const avgRating = agencies.length > 0 
    ? (agencies.reduce((sum, a) => sum + a.rating, 0) / agencies.length).toFixed(1) 
    : '0';
  const totalAgents = agencies.reduce((sum, a) => sum + a.agents, 0);
  const totalRevenue = agencies.reduce((sum, a) => sum + (a.revenue || 0), 0);
  
  // Distribution des propriétés par agence pour le graphique en camembert
  const preparePropertyDistribution = () => {
    if (agencies.length === 0) return [];
    
    // Si plus de 5 agences, regrouper les plus petites dans "Autres"
    if (agencies.length > 5) {
      const topAgencies = [...agencies].sort((a, b) => b.properties - a.properties).slice(0, 4);
      const otherAgencies = [...agencies].sort((a, b) => b.properties - a.properties).slice(4);
      
      const otherProperties = otherAgencies.reduce((sum, a) => sum + a.properties, 0);
      
      return [
        ...topAgencies.map(a => ({ name: a.name, value: a.properties })),
        { name: "Autres", value: otherProperties }
      ];
    }
    
    return agencies.map(a => ({ name: a.name, value: a.properties }));
  };

  return (
    <div className="space-y-8">
      {/* En-tête avec bouton de rafraîchissement */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Performance des Agences</h1>
          <p className="text-muted-foreground">Suivez les métriques clés et les performances des agences</p>
        </div>
        <Button 
          variant="outline" 
          onClick={refreshData} 
          disabled={loading || refreshing}
          className="flex items-center gap-2"
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
          {refreshing ? "Mise à jour..." : "Actualiser les données"}
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Propriétés gérées</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Chargement...</span>
              </div>
            ) : (
              <div className="text-3xl font-bold">{totalProperties}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Chargement...</span>
              </div>
            ) : (
              <div className="text-3xl font-bold">{avgRating} <span className="text-sm text-muted-foreground">/5</span></div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Agents actifs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Chargement...</span>
              </div>
            ) : (
              <div className="text-3xl font-bold">{totalAgents}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Chargement...</span>
              </div>
            ) : (
              <div className="text-3xl font-bold">{totalRevenue.toLocaleString()} <span className="text-sm text-muted-foreground">FCFA</span></div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Onglets pour les différentes vues */}
      <Tabs defaultValue="charts" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="charts">Graphiques</TabsTrigger>
            <TabsTrigger value="export">Exportation</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Contenu des onglets */}
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Graphique en camembert pour la distribution des propriétés */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution des propriétés</CardTitle>
                <CardDescription>Répartition des propriétés par agence</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 300 }}>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Chargement des données...</span>
                  </div>
                ) : errorMessage ? (
                  <div className="text-center text-red-500">{errorMessage}</div>
                ) : agencies.length === 0 ? (
                  <div className="text-center text-gray-500">Aucune donnée disponible</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Pie
                        data={preparePropertyDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {preparePropertyDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} propriétés`, '']}/>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Graphique à barres pour les scores de performance */}
            <Card>
              <CardHeader>
                <CardTitle>Score de performance</CardTitle>
                <CardDescription>Performance comparée des agences</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 300 }}>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Chargement des données...</span>
                  </div>
                ) : errorMessage ? (
                  <div className="text-center text-red-500">{errorMessage}</div>
                ) : agencies.length === 0 ? (
                  <div className="text-center text-gray-500">Aucune donnée disponible</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agencies} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="performance" fill="#8884d8" name="Performance" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Graphique à barres pour la notation des agences */}
            <Card>
              <CardHeader>
                <CardTitle>Satisfaction client</CardTitle>
                <CardDescription>Notes moyennes des agences</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 300 }}>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Chargement des données...</span>
                  </div>
                ) : errorMessage ? (
                  <div className="text-center text-red-500">{errorMessage}</div>
                ) : agencies.length === 0 ? (
                  <div className="text-center text-gray-500">Aucune donnée disponible</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agencies} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="rating" fill="#82ca9d" name="Note moyenne" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Graphique d'activité par mois */}
            <Card>
              <CardHeader>
                <CardTitle>Activité mensuelle</CardTitle>
                <CardDescription>Activité des agents et visites de propriétés</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 300 }}>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Chargement des données...</span>
                  </div>
                ) : errorMessage ? (
                  <div className="text-center text-red-500">{errorMessage}</div>
                ) : agentActivity.length === 0 ? (
                  <div className="text-center text-gray-500">Aucune donnée disponible</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={agentActivity} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="activity" stroke="#8884d8" name="Activité des agents" />
                      <Line type="monotone" dataKey="visits" stroke="#82ca9d" name="Visites" />
                      <Line type="monotone" dataKey="listings" stroke="#ffc658" name="Annonces" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet d'exportation */}
        <TabsContent value="export" className="space-y-4">
          <AgencyReportExport agencies={agencies} isLoading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 