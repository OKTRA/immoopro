
import React from 'react';
import { BarChartIcon, Loader2, PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { PageVisits } from '@/services/analytics/types';
import { CHART_COLORS, getMockUserTypeStats } from './useAnalyticsData';

interface ContentTabProps {
  isLoading: boolean;
  topPages: PageVisits[];
}

export function ContentTab({ isLoading, topPages }: ContentTabProps) {
  const userTypeStats = getMockUserTypeStats();
  
  return (
    <div className="space-y-6">
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
    </div>
  );
}
