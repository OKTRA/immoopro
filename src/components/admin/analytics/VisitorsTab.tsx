
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Users, Globe, Smartphone, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { AnalyticsDateRange, CHART_COLORS, getMockUserStats } from './useAnalyticsData';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';
import { VisitorSummary, DeviceBreakdown, GeographicData } from '@/services/analytics/types';
import { AnalyticsPeriod } from './useAnalyticsData';

interface VisitorsTabProps {
  isLoading: boolean;
  dateRange: AnalyticsDateRange;
  visitorStats: VisitorSummary | null;
  deviceData: DeviceBreakdown[];
  geoData: GeographicData[];
  period: AnalyticsPeriod;
}

export function VisitorsTab({
  isLoading,
  dateRange,
  visitorStats,
  deviceData,
  geoData,
  period
}: VisitorsTabProps) {
  const userStats = getMockUserStats();
  
  return (
    <div className="space-y-6">
      <AnalyticsSummaryCards visitorStats={visitorStats} period={period} />

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
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
    </div>
  );
}
