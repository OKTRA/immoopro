
import { VisitStatistic, VisitorSummary, PageVisits, DeviceBreakdown, GeographicData } from './types';
import { trackerService } from './trackerService';
import { summaryService } from './summaryService';
import { pageService } from './pageService';
import { deviceService } from './deviceService';
import { geoService } from './geoService';

/**
 * Main analytics service that combines all analytics functionality
 */
export const visitorAnalyticsService = {
  /**
   * Track a page view in the analytics system
   */
  async trackPageView(pageData: Partial<VisitStatistic>): Promise<void> {
    return trackerService.trackPageView(pageData);
  },
  
  /**
   * Get a summary of visitor statistics for a given time period
   */
  async getVisitorSummary(dateFrom?: Date, dateTo?: Date): Promise<VisitorSummary> {
    return summaryService.getVisitorSummary(dateFrom, dateTo);
  },
  
  /**
   * Get the top visited pages for a given time period
   */
  async getTopPages(limit: number = 10, dateFrom?: Date, dateTo?: Date): Promise<PageVisits[]> {
    return pageService.getTopPages(limit, dateFrom, dateTo);
  },
  
  /**
   * Get a breakdown of device types used by visitors
   */
  async getDeviceBreakdown(): Promise<DeviceBreakdown[]> {
    return deviceService.getDeviceBreakdown();
  },
  
  /**
   * Get a breakdown of visitor geographic locations
   */
  async getGeographicData(): Promise<GeographicData[]> {
    return geoService.getGeographicData();
  }
};

// Re-export the common types for convenience
export type { VisitStatistic, VisitorSummary, PageVisits, DeviceBreakdown, GeographicData };
