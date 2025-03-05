
import { supabase } from '@/lib/supabase';

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  entity_type?: string;
  entity_id?: string;
  created_at: Date;
  ip_address?: string;
  metadata?: Record<string, any>;
}

export const userActivityService = {
  async logActivity(activity: Omit<UserActivity, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase.from('user_activities').insert(activity);
      
      if (error) {
        console.error('Error logging user activity:', error);
      }
    } catch (error) {
      console.error('Failed to log user activity:', error);
    }
  },
  
  async getUserActivities(userId?: string, limit: number = 50): Promise<UserActivity[]> {
    try {
      let query = supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to get user activities:', error);
      throw error;
    }
  },
  
  async getRecentActivitySummary(): Promise<{ activity_type: string; count: number }[]> {
    try {
      const { data, error } = await supabase.rpc('get_recent_activity_summary');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to get activity summary:', error);
      return [];
    }
  }
};
