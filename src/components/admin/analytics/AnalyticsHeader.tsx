
import React from 'react';
import { Calendar, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { AnalyticsPeriod } from './useAnalyticsData';

interface AnalyticsHeaderProps {
  period: AnalyticsPeriod;
  setPeriod: (period: AnalyticsPeriod) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export function AnalyticsHeader({ period, setPeriod, isLoading, onRefresh }: AnalyticsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">Rapports & Analyses</h1>
      <div className="flex items-center gap-2">
        <Select
          value={period}
          onValueChange={(value) => setPeriod(value as AnalyticsPeriod)}
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
        
        <Button variant="outline" className="ml-2" disabled={isLoading} onClick={onRefresh}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {!isLoading && "Actualiser"}
        </Button>
      </div>
    </div>
  );
}
