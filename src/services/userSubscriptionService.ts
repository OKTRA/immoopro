import { supabase, handleSupabaseError } from '@/lib/supabase';
import { User } from '@/assets/types';

/**
 * Get all users with role 'agency' and their subscription information
 */
export const getAllUsersWithSubscriptions = async () => {
  try {
    // Récupérer les utilisateurs avec le rôle 'agency'
    const { data: agencyUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*, agencies:agency_id(*)')
      .eq('role', 'agency');

    if (usersError) throw usersError;
    
    if (!agencyUsers || agencyUsers.length === 0) {
      console.log('Aucun utilisateur avec le rôle "agency" n\'a été trouvé');
      return { users: [], error: 'Aucun utilisateur avec le rôle "agency" n\'a été trouvé' };
    }
    
    console.log(`${agencyUsers.length} utilisateurs avec le rôle "agency" trouvés`);
    
    // Pour chaque utilisateur agency, récupérer ses informations d'abonnement
    const usersWithSubscriptions = await Promise.all(
      agencyUsers.map(async (user) => {
        // Obtenir l'abonnement de l'utilisateur
        const { data: subscriptions, error: subError } = await supabase
          .from('user_subscriptions')
          .select(`
            id, 
            plan_id, 
            start_date, 
            end_date, 
            status, 
            auto_renew
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (subError) {
          console.error(`Error fetching subscription for user ${user.id}:`, subError);
          return user; // Retourner l'utilisateur sans infos d'abonnement en cas d'erreur
        }
        
        // Si l'utilisateur a des abonnements, récupérer les détails du plan
        if (subscriptions && subscriptions.length > 0) {
          const { data: planDetails, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', subscriptions[0].plan_id)
            .single();
          
          if (planError) {
            console.error(`Error fetching plan details for subscription:`, planError);
            return { ...user, user_subscriptions: subscriptions };
          }
          
          // Ajouter les détails du plan à l'abonnement
          const subscriptionsWithPlan = subscriptions.map(sub => ({
            ...sub,
            subscription_plans: planDetails
          }));
          
          return { ...user, user_subscriptions: subscriptionsWithPlan };
        }
        
        return { ...user, user_subscriptions: [] };
      })
    );
    
    return { users: usersWithSubscriptions, error: null };
  } catch (error: any) {
    console.error('Error getting agency users with subscriptions:', error);
    return { users: [], error: error.message };
  }
};

/**
 * Get user subscription details
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

/**
 * Assign subscription plan to a user with role 'agency'
 */
export const assignSubscriptionToUser = async (userId: string, planId: string) => {
  try {
    // Vérifier que l'ID est bien un utilisateur avec le rôle 'agency'
    const { data: agencyUser, error: userError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role, agency_id')
      .eq('id', userId)
      .eq('role', 'agency')
      .single();
    
    if (userError || !agencyUser) {
      throw new Error('L\'ID fourni ne correspond pas à un utilisateur avec le rôle "agency"');
    }
    
    // Get the subscription plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (planError) throw planError;
    
    // Calculate start and end dates based on billing cycle
    const startDate = new Date();
    let endDate = new Date();
    
    if (plan.billing_cycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.billing_cycle === 'annually') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (plan.billing_cycle === 'quarterly') {
      endDate.setMonth(endDate.getMonth() + 3);
    }
    
    // Check if agent already has a subscription
    const { data: existingSub, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    let result;
    
    if (existingSub) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          plan_id: planId,
          start_date: startDate,
          end_date: endDate,
          status: 'active',
          auto_renew: true,
          updated_at: new Date()
        })
        .eq('id', existingSub.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert([{
          user_id: userId,
          agency_id: agencyUser.agency_id, // On associe aussi l'agence si l'utilisateur a une agence associée
          plan_id: planId,
          start_date: startDate,
          end_date: endDate,
          status: 'active',
          auto_renew: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    // Générer un ID de transaction unique
    const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;    
    
    // Récupérer le nom de l'agence si l'utilisateur a une agence associée
    let agencyName = '';
    if (agencyUser.agency_id) {
      const { data: agencyData } = await supabase
        .from('agencies')
        .select('name')
        .eq('id', agencyUser.agency_id)
        .single();
      
      if (agencyData) {
        agencyName = agencyData.name;
      }
    }
    
    // Construire le nom de l'utilisateur
    const userName = agencyUser.first_name && agencyUser.last_name
      ? `${agencyUser.first_name} ${agencyUser.last_name}`.trim()
      : agencyUser.email || 'Utilisateur agency';
    
    // Add entry to billing history
    await supabase
      .from('billing_history')
      .insert([{
        user_id: userId,
        agency_id: agencyUser.agency_id,
        plan_id: planId,
        amount: plan.price,
        description: `Abonnement au plan ${plan.name} pour ${userName}${agencyName ? ` (Agence: ${agencyName})` : ''}`,
        status: 'completed',
        payment_method: 'manuel',
        transaction_id: transactionId,
        payment_date: new Date()
      }]);
    
    return { subscription: result, error: null };
  } catch (error: any) {
    console.error(`Error assigning subscription to agency user ${userId}:`, error);
    return { subscription: null, error: error.message };
  }
};

/**
 * Cancel user subscription
 */
export const cancelUserSubscription = async (subscriptionId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        auto_renew: false,
        updated_at: new Date()
      })
      .eq('id', subscriptionId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, subscription: data, error: null };
  } catch (error: any) {
    console.error(`Error cancelling subscription ${subscriptionId}:`, error);
    return { success: false, subscription: null, error: error.message };
  }
};

/**
 * Get a free plan as default plan
 */
export const getDefaultFreePlan = async () => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('price', 0)
      .eq('is_active', true)
      .maybeSingle();
    
    if (error) throw error;
    
    // If no free plan exists, return null
    return { freePlan: data, error: null };
  } catch (error: any) {
    console.error('Error getting free plan:', error);
    return { freePlan: null, error: error.message };
  }
};

/**
 * Create default free plan if it doesn't exist
 */
export const ensureDefaultFreePlanExists = async () => {
  try {
    // Check if free plan exists
    const { freePlan, error: checkError } = await getDefaultFreePlan();
    
    if (checkError) throw checkError;
    
    // If free plan exists, return it
    if (freePlan) {
      return { freePlan, error: null };
    }
    
    // Create new free plan
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert([{
        name: 'Plan Gratuit',
        price: 0,
        billing_cycle: 'monthly',
        features: ['Accès de base', 'Vue limitée des propriétés'],
        is_active: true,
        max_properties: 1,
        max_users: 1,
        has_api_access: false,
        max_agencies: 0,
        max_leases: 1,
        max_shops: 0,
        max_products: 0
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return { freePlan: data, error: null };
  } catch (error: any) {
    console.error('Error ensuring free plan exists:', error);
    return { freePlan: null, error: error.message };
  }
};
