
import { supabase, handleSupabaseError } from '@/lib/supabase';

/**
 * Create a tenant payment notification
 */
export const createTenantPaymentNotification = async (
  tenantId: string,
  amount: number,
  dueDate: string,
  message: string,
  notificationType: string,
  referenceId?: string
) => {
  try {
    const notificationData = {
      tenant_id: tenantId,
      amount,
      due_date: dueDate,
      message,
      sent_date: new Date().toISOString(),
      is_read: false,
      notification_type: notificationType,
      reference_id: referenceId
    };
    
    const { data, error } = await supabase
      .from('payment_notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;
    return { notification: data, error: null };
  } catch (error: any) {
    console.error('Error creating payment notification:', error);
    return { notification: null, error: error.message };
  }
};

/**
 * Get tenant notifications
 */
export const getTenantNotifications = async (
  tenantId: string,
  unreadOnly = false,
  limit = 10,
  offset = 0
) => {
  try {
    let query = supabase
      .from('payment_notifications')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('sent_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }
    
    const { data, error, count } = await query;

    if (error) throw error;
    return { notifications: data, count, error: null };
  } catch (error: any) {
    console.error(`Error getting notifications for tenant ${tenantId}:`, error);
    return { notifications: [], count: 0, error: error.message };
  }
};

/**
 * Mark tenant notification as read
 */
export const markTenantNotificationAsRead = async (notificationId: string) => {
  try {
    const { data, error } = await supabase
      .from('payment_notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return { notification: data, error: null };
  } catch (error: any) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    return { notification: null, error: error.message };
  }
};

/**
 * Delete tenant notification
 */
export const deleteTenantNotification = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('payment_notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Error deleting notification ${notificationId}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get unread notifications count
 */
export const getUnreadNotificationsCount = async (tenantId: string) => {
  try {
    const { count, error } = await supabase
      .from('payment_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_read', false);

    if (error) throw error;
    return { count: count || 0, error: null };
  } catch (error: any) {
    console.error(`Error getting unread notifications count for tenant ${tenantId}:`, error);
    return { count: 0, error: error.message };
  }
};

/**
 * Get upcoming payments
 */
export const getUpcomingPayments = async (tenantId: string, days = 30) => {
  try {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    const { data, error } = await supabase
      .from('payment_notifications')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('due_date', today.toISOString().split('T')[0])
      .lte('due_date', futureDate.toISOString().split('T')[0])
      .order('due_date');

    if (error) throw error;
    return { notifications: data, error: null };
  } catch (error: any) {
    console.error(`Error getting upcoming payments for tenant ${tenantId}:`, error);
    return { notifications: [], error: error.message };
  }
};

/**
 * Create admin payment notification
 */
export const createAdminPaymentNotification = async (
  adminId: string,
  tenantId: string,
  apartmentId: string,
  amountDue: number,
  dueDate: string,
  message: string,
  status: string
) => {
  try {
    const notificationData = {
      admin_id: adminId,
      tenant_id: tenantId,
      apartment_id: apartmentId,
      amount_due: amountDue,
      due_date: dueDate,
      message,
      sent_date: new Date().toISOString(),
      status
    };
    
    const { data, error } = await supabase
      .from('admin_payment_notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;
    return { notification: data, error: null };
  } catch (error: any) {
    console.error('Error creating admin payment notification:', error);
    return { notification: null, error: error.message };
  }
};
