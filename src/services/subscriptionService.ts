
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { SubscriptionPlan } from '@/assets/types';

/**
 * Get all subscription plans
 */
export const getAllSubscriptionPlans = async (activeOnly = true) => {
  try {
    let query = supabase
      .from('subscription_plans')
      .select('*');
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('price', { ascending: true });

    if (error) throw error;
    
    const plans: SubscriptionPlan[] = data.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      billingCycle: plan.billing_cycle,
      features: plan.features,
      isActive: plan.is_active,
      maxProperties: plan.max_properties,
      maxUsers: plan.max_users,
      hasApiAccess: plan.has_api_access
    }));
    
    return { plans, error: null };
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
    
    const plan: SubscriptionPlan = {
      id: data.id,
      name: data.name,
      price: data.price,
      billingCycle: data.billing_cycle,
      features: data.features,
      isActive: data.is_active,
      maxProperties: data.max_properties,
      maxUsers: data.max_users,
      hasApiAccess: data.has_api_access
    };
    
    return { plan, error: null };
  } catch (error: any) {
    console.error(`Error getting subscription plan with ID ${id}:`, error);
    return { plan: null, error: error.message };
  }
};

/**
 * Create a new subscription plan (admin only)
 */
export const createSubscriptionPlan = async (planData: Omit<SubscriptionPlan, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert([{
        name: planData.name,
        price: planData.price,
        billing_cycle: planData.billingCycle,
        features: planData.features,
        is_active: planData.isActive,
        max_properties: planData.maxProperties,
        max_users: planData.maxUsers,
        has_api_access: planData.hasApiAccess
      }])
      .select()
      .single();

    if (error) throw error;
    
    const plan: SubscriptionPlan = {
      id: data.id,
      name: data.name,
      price: data.price,
      billingCycle: data.billing_cycle,
      features: data.features,
      isActive: data.is_active,
      maxProperties: data.max_properties,
      maxUsers: data.max_users,
      hasApiAccess: data.has_api_access
    };
    
    return { plan, error: null };
  } catch (error: any) {
    console.error('Error creating subscription plan:', error);
    return { plan: null, error: error.message };
  }
};

/**
 * Update a subscription plan (admin only)
 */
export const updateSubscriptionPlan = async (id: string, planData: Partial<SubscriptionPlan>) => {
  try {
    const updateData: any = {};
    if (planData.name !== undefined) updateData.name = planData.name;
    if (planData.price !== undefined) updateData.price = planData.price;
    if (planData.billingCycle !== undefined) updateData.billing_cycle = planData.billingCycle;
    if (planData.features !== undefined) updateData.features = planData.features;
    if (planData.isActive !== undefined) updateData.is_active = planData.isActive;
    if (planData.maxProperties !== undefined) updateData.max_properties = planData.maxProperties;
    if (planData.maxUsers !== undefined) updateData.max_users = planData.maxUsers;
    if (planData.hasApiAccess !== undefined) updateData.has_api_access = planData.hasApiAccess;

    const { data, error } = await supabase
      .from('subscription_plans')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    const plan: SubscriptionPlan = {
      id: data.id,
      name: data.name,
      price: data.price,
      billingCycle: data.billing_cycle,
      features: data.features,
      isActive: data.is_active,
      maxProperties: data.max_properties,
      maxUsers: data.max_users,
      hasApiAccess: data.has_api_access
    };
    
    return { plan, error: null };
  } catch (error: any) {
    console.error(`Error updating subscription plan with ID ${id}:`, error);
    return { plan: null, error: error.message };
  }
};

/**
 * Delete a subscription plan (admin only)
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

/**
 * Get user subscription
 */
export const getUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans:plan_id (*)
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    
    return { subscription: data, error: null };
  } catch (error: any) {
    console.error(`Error getting subscription for user ${userId}:`, error);
    return { subscription: null, error: error.message };
  }
};
