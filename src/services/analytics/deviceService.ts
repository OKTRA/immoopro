
import { supabase } from '@/lib/supabase';
import { DeviceBreakdown } from './types';

/**
 * Service responsible for retrieving device usage statistics
 */
export const deviceService = {
  /**
   * Get a breakdown of device types used by visitors
   */
  async getDeviceBreakdown(): Promise<DeviceBreakdown[]> {
    try {
      const { data, error } = await supabase
        .from('visit_statistics')
        .select('device_type');
      
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      const deviceCounts: Record<string, number> = {};
      const total = data.length;
      
      data.forEach(visit => {
        const deviceType = visit.device_type || 'unknown';
        deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1;
      });
      
      return Object.entries(deviceCounts).map(([device_type, count]) => ({
        device_type,
        count,
        percentage: (count / total) * 100
      }));
    } catch (error) {
      console.error('Failed to get device breakdown:', error);
      throw error;
    }
  }
};
