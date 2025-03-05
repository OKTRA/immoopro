
import { useState, useEffect } from 'react';
import { subDays, subMonths } from 'date-fns';
import { visitorAnalyticsService } from '@/services/analytics/visitorAnalyticsService';
import { 
  VisitorSummary, 
  PageVisits, 
  DeviceBreakdown, 
  GeographicData 
} from '@/services/analytics/types';

export type AnalyticsPeriod = 'week' | 'month' | 'quarter' | 'year';

export interface AnalyticsDateRange {
  from: Date;
  to: Date;
}

export function useAnalyticsData(period: AnalyticsPeriod) {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [visitorStats, setVisitorStats] = useState<VisitorSummary | null>(null);
  const [topPages, setTopPages] = useState<PageVisits[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceBreakdown[]>([]);
  const [geoData, setGeoData] = useState<GeographicData[]>([]);
  
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
        // Use mock data as fallback
        setVisitorStats({
          total_visitors: 153,
          new_visitors: 89,
          returning_visitors: 64,
          average_duration: 125,
          bounce_rate: 45.2
        });
        setTopPages(getMockTopPages());
        setDeviceData(getMockDeviceData());
        setGeoData(getMockGeoData());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [period]);

  return {
    isLoading,
    dateRange,
    visitorStats,
    topPages,
    deviceData,
    geoData
  };
}

// Mock data for development and fallback
export const getMockUserStats = () => [
  { name: 'Jan', count: 15 },
  { name: 'Fév', count: 22 },
  { name: 'Mar', count: 34 },
  { name: 'Avr', count: 45 },
  { name: 'Mai', count: 53 },
  { name: 'Juin', count: 60 },
];

export const getMockPropertyStats = () => [
  { name: 'Jan', count: 5 },
  { name: 'Fév', count: 12 },
  { name: 'Mar', count: 18 },
  { name: 'Avr', count: 25 },
  { name: 'Mai', count: 30 },
  { name: 'Juin', count: 38 },
];

export const getMockRevenueStats = () => [
  { name: 'Jan', amount: 1200 },
  { name: 'Fév', amount: 1800 },
  { name: 'Mar', amount: 2400 },
  { name: 'Avr', amount: 3100 },
  { name: 'Mai', amount: 3800 },
  { name: 'Juin', amount: 4500 },
];

export const getMockUserTypeStats = () => [
  { name: 'Propriétaires', value: 35 },
  { name: 'Locataires', value: 45 },
  { name: 'Agents', value: 15 },
  { name: 'Admin', value: 5 },
];

export const getMockPropertyTypeStats = () => [
  { name: 'Appartements', value: 55 },
  { name: 'Maisons', value: 25 },
  { name: 'Commerces', value: 10 },
  { name: 'Terrains', value: 10 },
];

export const getMockPaymentMethodStats = () => [
  { name: 'Carte bancaire', value: 65 },
  { name: 'Virement', value: 30 },
  { name: 'Autres', value: 5 },
];

export const getMockTopPages = () => [
  { page: '/', visits: 320, unique_visitors: 280, average_duration: 45 },
  { page: '/properties', visits: 245, unique_visitors: 210, average_duration: 65 },
  { page: '/login', visits: 180, unique_visitors: 170, average_duration: 25 },
  { page: '/register', visits: 120, unique_visitors: 115, average_duration: 40 },
  { page: '/contact', visits: 95, unique_visitors: 90, average_duration: 30 },
];

export const getMockDeviceData = () => [
  { device_type: 'mobile', count: 150, percentage: 45 },
  { device_type: 'desktop', count: 130, percentage: 35 },
  { device_type: 'tablet', count: 70, percentage: 20 },
];

export const getMockGeoData = () => [
  { country: 'France', count: 180, percentage: 55 },
  { country: 'United States', count: 45, percentage: 15 },
  { country: 'United Kingdom', count: 35, percentage: 10 },
  { country: 'Germany', count: 25, percentage: 8 },
  { country: 'Other', count: 40, percentage: 12 },
];

export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
