
import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import {
  Bar, BarChart, Line, LineChart, Pie, PieChart, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Legend
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, DollarSign, Users, ArrowUpDown } from 'lucide-react';
import { 
  getMockPropertyStats, 
  getMockRevenueStats,
  getMockUserTypeStats,
  getMockPropertyTypeStats,
  getMockPaymentMethodStats,
  CHART_COLORS
} from './useAnalyticsData';
import { supabase } from '@/lib/supabase';

export function BusinessTab() {
  const [activeTab, setActiveTab] = useState('properties');
  const [isLoading, setIsLoading] = useState(false);
  const [businessStats, setBusinessStats] = useState({
    totalProperties: 0,
    totalUsers: 0,
    avgPropertyPrice: 0,
    totalBookings: 0
  });
  
  const propertyStats = getMockPropertyStats();
  const revenueStats = getMockRevenueStats();
  const userTypeStats = getMockUserTypeStats();
  const propertyTypeStats = getMockPropertyTypeStats();
  const paymentMethodStats = getMockPaymentMethodStats();
  
  useEffect(() => {
    const fetchBusinessStats = async () => {
      setIsLoading(true);
      try {
        // Get total properties count
        const { count: propertyCount, error: propertyError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });
          
        // Get total users count  
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        // Get average property price
        const { data: priceData, error: priceError } = await supabase
          .from('properties')
          .select('price');
          
        let avgPrice = 0;
        if (priceData && priceData.length > 0) {
          const total = priceData.reduce((sum, property) => sum + (property.price || 0), 0);
          avgPrice = total / priceData.length;
        }
        
        // Get total bookings
        const { count: bookingCount, error: bookingError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true });
          
        setBusinessStats({
          totalProperties: propertyCount || 0,
          totalUsers: userCount || 0,
          avgPropertyPrice: avgPrice,
          totalBookings: bookingCount || 0
        });
      } catch (error) {
        console.error('Error fetching business stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBusinessStats();
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Propriétés
                </p>
                <p className="text-2xl font-bold">
                  {businessStats.totalProperties}
                </p>
              </div>
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Utilisateurs
                </p>
                <p className="text-2xl font-bold">
                  {businessStats.totalUsers}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Prix moyen
                </p>
                <p className="text-2xl font-bold">
                  {businessStats.avgPropertyPrice.toLocaleString(undefined, {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Réservations
                </p>
                <p className="text-2xl font-bold">
                  {businessStats.totalBookings}
                </p>
              </div>
              <ArrowUpDown className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="properties">
            <Building className="h-4 w-4 mr-2" />
            Propriétés
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <DollarSign className="h-4 w-4 mr-2" />
            Revenus
          </TabsTrigger>
          <TabsTrigger value="distributions">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Distributions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>Propriétés listées par mois</CardTitle>
              <CardDescription>
                Évolution du nombre de propriétés sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={propertyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Propriétés" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenus mensuels</CardTitle>
              <CardDescription>
                Revenus générés par la plateforme au fil du temps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} €`, 'Montant']} />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Revenus"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distributions">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Types d'utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userTypeStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userTypeStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
                <CardTitle className="text-base">Types de propriétés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
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
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
                <CardTitle className="text-base">Méthodes de paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
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
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
      </Tabs>
    </div>
  );
}
