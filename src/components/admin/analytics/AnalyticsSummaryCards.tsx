
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, RefreshCw } from 'lucide-react';
import { Clock } from '../icons/Clock';
import { VisitorSummary } from '@/services/analytics/types';
import { AnalyticsPeriod } from './useAnalyticsData';

interface AnalyticsSummaryCardsProps {
  visitorStats: VisitorSummary | null;
  period: AnalyticsPeriod;
}

export function AnalyticsSummaryCards({ visitorStats, period }: AnalyticsSummaryCardsProps) {
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
    { title: "Propriétés listées", value: "38", icon: Users, change: "+8% ce mois" },
    { title: "Revenus mensuels", value: "4 500 €", icon: Users, change: "+15% ce mois" },
    { title: "Taux d'occupation", value: "78%", icon: TrendingUp, change: "+5% ce mois" },
  ];

  return (
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
  );
}
