
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { CHART_COLORS, getMockUserTypeStats } from './useAnalyticsData';

export function TechnicalTab() {
  const userTypeStats = getMockUserTypeStats();
  
  return (
    <div className="space-y-6">
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
    </div>
  );
}
