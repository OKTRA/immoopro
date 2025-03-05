
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsHeader } from './AnalyticsHeader';
import { VisitorsTab } from './VisitorsTab';
import { ContentTab } from './ContentTab';
import { BusinessTab } from './BusinessTab';
import { TechnicalTab } from './TechnicalTab';
import { useAnalyticsData, AnalyticsPeriod } from './useAnalyticsData';

export default function AnalyticsManagement() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('month');
  const [activeTab, setActiveTab] = useState('visitors');
  const {
    isLoading,
    dateRange,
    visitorStats,
    topPages,
    deviceData,
    geoData
  } = useAnalyticsData(period);

  const handleRefresh = () => {
    // Force re-fetching data by toggling period and then back
    const currentPeriod = period;
    const tempPeriod = currentPeriod === 'month' ? 'week' : 'month';
    setPeriod(tempPeriod);
    setTimeout(() => setPeriod(currentPeriod), 100);
  };

  return (
    <>
      <AnalyticsHeader 
        period={period} 
        setPeriod={setPeriod} 
        isLoading={isLoading} 
        onRefresh={handleRefresh} 
      />

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="visitors">Visiteurs</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="business">Affaires</TabsTrigger>
          <TabsTrigger value="technical">Technique</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visitors" className="space-y-6">
          <VisitorsTab 
            isLoading={isLoading}
            dateRange={dateRange}
            visitorStats={visitorStats}
            deviceData={deviceData}
            geoData={geoData}
            period={period}
          />
        </TabsContent>
        
        <TabsContent value="content" className="space-y-6">
          <ContentTab isLoading={isLoading} topPages={topPages} />
        </TabsContent>
        
        <TabsContent value="business" className="space-y-6">
          <BusinessTab />
        </TabsContent>
        
        <TabsContent value="technical" className="space-y-6">
          <TechnicalTab />
        </TabsContent>
      </Tabs>
    </>
  );
}
