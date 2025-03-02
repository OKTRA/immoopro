
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { SubscriptionPlan } from '@/assets/types';

/**
 * Get all subscription plans
 */
export const getAllSubscriptionPlans = async (activeOnly = true) => {
  try {
    let query = supabase
      .from('subscription_plans')
      .select('*')
      .order('price');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    return { plans: data, error: null };
  } catch (error: any) {
    console.error('Error getting subscription plans:', error);
    return { plans: [], error: error.message };
  }
};

/**
 * Get subscription plan by ID
 */
export const getSubscriptionPlanById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { plan: data, error: null };
  } catch (error: any) {
    console.error(`Error getting subscription plan with ID ${id}:`, error);
    return { plan: null, error: error.message };
  }
};

/**
 * Create a new subscription plan
 */
export const createSubscriptionPlan = async (planData: Omit<SubscriptionPlan, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert([planData])
      .select()
      .single();

    if (error) throw error;
    return { plan: data, error: null };
  } catch (error: any) {
    console.error('Error creating subscription plan:', error);
    return { plan: null, error: error.message };
  }
};

/**
 * Update a subscription plan
 */
export const updateSubscriptionPlan = async (id: string, planData: Partial<SubscriptionPlan>) => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .update(planData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { plan: data, error: null };
  } catch (error: any) {
    console.error(`Error updating subscription plan with ID ${id}:`, error);
    return { plan: null, error: error.message };
  }
};

/**
 * Deactivate a subscription plan
 */
export const deactivateSubscriptionPlan = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { plan: data, error: null };
  } catch (error: any) {
    console.error(`Error deactivating subscription plan with ID ${id}:`, error);
    return { plan: null, error: error.message };
  }
};

/**
 * Delete a subscription plan
 */
export const deleteSubscriptionPlan = async (id: string) => {
  try {
    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Error deleting subscription plan with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};
