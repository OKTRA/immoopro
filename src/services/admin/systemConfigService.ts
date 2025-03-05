
import { supabase } from '@/lib/supabase';

export interface SystemConfig {
  id: string;
  config_key: string;
  config_value: any;
  description?: string;
  category: string;
  is_public: boolean;
  updated_at: Date;
  updated_by?: string;
}

export const systemConfigService = {
  async getConfig(key: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('config_value')
        .eq('config_key', key)
        .single();
      
      if (error) throw error;
      
      return data?.config_value;
    } catch (error) {
      console.error(`Failed to get config for key ${key}:`, error);
      return null;
    }
  },
  
  async getAllConfig(category?: string): Promise<SystemConfig[]> {
    try {
      let query = supabase
        .from('system_config')
        .select('*');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to get all config:', error);
      return [];
    }
  },
  
  async updateConfig(key: string, value: any, userId?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('system_config')
        .update({ 
          config_value: value,
          updated_at: new Date().toISOString(),
          updated_by: userId
        })
        .eq('config_key', key);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error(`Failed to update config for key ${key}:`, error);
      return false;
    }
  },
  
  async createConfig(config: Omit<SystemConfig, 'id' | 'updated_at'>): Promise<SystemConfig | null> {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .insert(config)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Failed to create config:', error);
      return null;
    }
  },
  
  async getConfigCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('category');
      
      if (error) throw error;
      
      // Get unique categories
      const categories = [...new Set(data?.map(item => item.category))];
      return categories || [];
    } catch (error) {
      console.error('Failed to get config categories:', error);
      return [];
    }
  }
};
