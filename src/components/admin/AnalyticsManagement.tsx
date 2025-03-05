
import React, { useEffect, useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Users, 
  Home, 
  CreditCard,
  Loader2,
  Calendar
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { visitorAnalyticsService } from '@/services/analytics/visitorAnalyticsService';
import { subDays, subMonths, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AnalyticsManagement() {
  const [period, setPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('visitors');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [visitorStats, setVisitorStats] = useState<any>(null);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Set date range based on period
        let from = new Date();
        const to = new Date();
        
        switch (period) {
          case 'week':
            from = subDays(to, 7);
            break;
          case 'month':
            from = subDays(to, 30);
            break;
          case 'quarter':
            from = subMonths(to, 3);
            break;
          case 'year':
            from = subMonths(to, 12);
            break;
        }
        
        setDateRange({ from, to });
        
        // Fetch visitor summary stats
        const summary = await visitorAnalyticsService.getVisitorSummary(from, to);
        setVisitorStats(summary);
        
        // Fetch top pages
        const pages = await visitorAnalyticsService.getTopPages(10, from, to);
        setTopPages(pages);
        
        // Fetch device breakdown
        const devices = await visitorAnalyticsService.getDeviceBreakdown();
        setDeviceData(devices);
        
        // Fetch geographic data
        const geo = await visitorAnalyticsService.getGeographicData();
        setGeoData(geo);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [period]);
  
  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };

  // In case we don't have real data yet, use the mock data
  const userStats = [
    { name: 'Jan', count: 15 },
    { name: 'Fév', count: 22 },
    { name: 'Mar', count: 34 },
    { name: 'Avr', count: 45 },
    { name: 'Mai', count: 53 },
    { name: 'Juin', count: 60 },
  ];
  
  const propertyStats = [
    { name: 'Jan', count: 5 },
    { name: 'Fév', count: 12 },
    { name: 'Mar', count: 18 },
    { name: 'Avr', count: 25 },
    { name: 'Mai', count: 30 },
    { name: 'Juin', count: 38 },
  ];
  
  const revenueStats = [
    { name: 'Jan', amount: 1200 },
    { name: 'Fév', amount: 1800 },
    { name: 'Mar', amount: 2400 },
    { name: 'Avr', amount: 3100 },
    { name: 'Mai', amount: 3800 },
    { name: 'Juin', amount: 4500 },
  ];
  
  const userTypeStats = [
    { name: 'Propriétaires', value: 35 },
    { name: 'Locataires', value: 45 },
    { name: 'Agents', value: 15 },
    { name: 'Admin', value: 5 },
  ];
  
  const propertyTypeStats = [
    { name: 'Appartements', value: 55 },
    { name: 'Maisons', value: 25 },
    { name: 'Commerces', value: 10 },
    { name: 'Terrains', value: 10 },
  ];
  
  const paymentMethodStats = [
    { name: 'Carte bancaire', value: 65 },
    { name: 'Virement', value: 30 },
    { name: 'Autres', value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // Data for summary cards
  const SUMMARY_DATA = visitorStats ? [
    { 
      title: "Utilisateurs totaux", 
      value: visitorStats.total_visitors.toString(), 
      icon: Users, 
      change: `${visitorStats.new_visitors} nouveaux ce ${period === 'week' ? 'mois' : period}` 
    },
    { 
      title: "Taux de rebond", 
      value: `${visitorStats.bounce_rate.toFixed(1)}%`, 
      icon: TrendingUp, 
      change: "Visiteurs n'ayant vu qu'une page" 
    },
    { 
      title: "Temps moyen", 
      value: `${Math.floor(visitorStats.average_duration / 60)}m ${Math.floor(visitorStats.average_duration % 60)}s`, 
      icon: Clock, 
      change: "Durée par visite" 
    },
    { 
      title: "Visiteurs récurrents", 
      value: `${visitorStats.returning_visitors}`, 
      icon: RefreshCw, 
      change: `${(visitorStats.returning_visitors / visitorStats.total_visitors * 100).toFixed(1)}% du total` 
    },
  ] : [
    { title: "Utilisateurs totaux", value: "153", icon: Users, change: "+12% ce mois" },
    { title: "Propriétés listées", value: "38", icon: Home, change: "+8% ce mois" },
    { title: "Revenus mensuels", value: "4 500 €", icon: CreditCard, change: "+15% ce mois" },
    { title: "Taux d'occupation", value: "78%", icon: TrendingUp, change: "+5% ce mois" },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Rapports & Analyses</h1>
        <div className="flex items-center gap-2">
          <Select
            value={period}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" className="ml-2" disabled={isLoading}>
            <Calendar className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" className="ml-2" disabled={isLoading} onClick={() => {
            setIsLoading(true);
            // Simulate refresh
            setTimeout(() => setIsLoading(false), 1000);
          }}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {!isLoading && "Actualiser"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="visitors">Visiteurs</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="business">Affaires</TabsTrigger>
          <TabsTrigger value="technical">Technique</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visitors" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {SUMMARY_DATA.map((item, i) => (
              <Card key={i}>
                <CardContent className="p-6 flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {item.title}
                    </p>
                    <h3 className="text-2xl font-bold mt-2">{item.value}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.change}
                    </p>
                  </div>
                  <item.icon className="h-8 w-8 text-muted-foreground opacity-50" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Growth Charts */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Visites par période
                </CardTitle>
                <CardDescription>
                  {`${format(dateRange.from, 'PPP', { locale: fr })} - ${format(dateRange.to, 'PPP', { locale: fr })}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Origine géographique
                </CardTitle>
                <CardDescription>Répartition des visiteurs par pays</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={geoData.length > 0 ? geoData : [{ country: 'Non disponible', count: 1 }]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="country"
                        >
                          {geoData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="h-5 w-5 mr-2" />
                Types d'appareils
              </CardTitle>
              <CardDescription>Répartition des visiteurs par type d'appareil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deviceData.length > 0 ? deviceData : [
                      { device_type: 'mobile', count: 45 },
                      { device_type: 'desktop', count: 35 },
                      { device_type: 'tablet', count: 20 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="device_type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pages les plus visitées</CardTitle>
              <CardDescription>Pages avec le plus grand nombre de vues</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-8">
                  {topPages.length > 0 ? topPages.map((page, i) => (
                    <div key={i} className="flex items-center">
                      <div className="font-medium w-8">{i + 1}</div>
                      <div className="flex-1 ml-2">
                        <div className="font-medium">{page.page}</div>
                        <div className="text-sm text-muted-foreground">
                          {page.unique_visitors} visiteurs uniques • {Math.round(page.average_duration)} secondes en moyenne
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{page.visits}</div>
                        <div className="text-sm text-muted-foreground">vues</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune donnée disponible pour cette période
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Taux de conversion</CardTitle>
                <CardDescription>Conversion des visiteurs en clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Visite', value: 100 },
                      { name: 'Recherche', value: 75 },
                      { name: 'Contact', value: 40 },
                      { name: 'Réservation', value: 15 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sources de trafic</CardTitle>
                <CardDescription>D'où viennent vos visiteurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Direct', value: 40 },
                          { name: 'Recherche', value: 30 },
                          { name: 'Social', value: 15 },
                          { name: 'Référent', value: 15 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userTypeStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="business" className="space-y-6">
          {/* Business metrics */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Propriétés par période
                </CardTitle>
                <CardDescription>Nouvelles propriétés enregistrées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={propertyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChartIcon className="h-5 w-5 mr-2" />
                  Revenus mensuels
                </CardTitle>
                <CardDescription>Revenus générés par mois en euros</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property and Payment Method Stats */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2" />
                  Types de propriétés
                </CardTitle>
                <CardDescription>Répartition par type de propriété</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={propertyTypeStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {propertyTypeStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2" />
                  Méthodes de paiement
                </CardTitle>
                <CardDescription>Répartition par méthode de paiement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentMethodStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="technical" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performances du site</CardTitle>
                <CardDescription>Temps de chargement moyen par page (secondes)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { page: 'Accueil', time: 1.2 },
                      { page: 'Recherche', time: 1.8 },
                      { page: 'Détails', time: 2.3 },
                      { page: 'Paiement', time: 1.5 },
                      { page: 'Dashboard', time: 3.1 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="page" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="time" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Navigateurs utilisés</CardTitle>
                <CardDescription>Répartition par navigateur</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Chrome', value: 55 },
                          { name: 'Safari', value: 25 },
                          { name: 'Firefox', value: 10 },
                          { name: 'Edge', value: 8 },
                          { name: 'Autres', value: 2 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userTypeStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Erreurs détectées</CardTitle>
              <CardDescription>Erreurs JavaScript des 7 derniers jours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-3 p-4 font-medium border-b">
                  <div>Message</div>
                  <div>Page</div>
                  <div className="text-right">Occurrences</div>
                </div>
                <div className="divide-y">
                  {[
                    { message: "Cannot read property 'length' of undefined", page: "/search", count: 24 },
                    { message: "NetworkError when attempting to fetch resource", page: "/api/properties", count: 18 },
                    { message: "Uncaught TypeError: Cannot read property 'data' of null", page: "/property/details", count: 12 },
                    { message: "Failed to load resource: the server responded with a status of 404", page: "/images/property_15.jpg", count: 8 }
                  ].map((error, i) => (
                    <div key={i} className="grid grid-cols-3 p-4">
                      <div className="text-sm truncate">{error.message}</div>
                      <div className="text-sm">{error.page}</div>
                      <div className="text-sm text-right">{error.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

// Additional icons needed
function Clock(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function Globe(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function RefreshCw(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v6h6" />
      <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
      <path d="M21 22v-6h-6" />
      <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
    </svg>
  )
}

function Smartphone(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  )
}
