
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { AdminNotification } from '@/assets/types';

/**
 * Get admin by user ID
 */
export const getAdminByUserId = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('administrators')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { admin: data, error: null };
  } catch (error: any) {
    console.error(`Error getting admin with user ID ${userId}:`, error);
    return { admin: null, error: error.message };
  }
};

/**
 * Create admin notification
 */
export const createAdminNotification = async (notification: Omit<AdminNotification, 'id' | 'createdAt'>) => {
  try {
    const notificationData = {
      ...notification,
      created_at: new Date().toISOString(),
      is_read: false
    };
    
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;
    return { notification: data, error: null };
  } catch (error: any) {
    console.error('Error creating admin notification:', error);
    return { notification: null, error: error.message };
  }
};

/**
 * Get admin notifications
 */
export const getAdminNotifications = async (
  adminId: string,
  unreadOnly = false,
  limit = 20,
  offset = 0
) => {
  try {
    let query = supabase
      .from('admin_notifications')
      .select('*', { count: 'exact' })
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }
    
    const { data, error, count } = await query;

    if (error) throw error;
    return { notifications: data, count, error: null };
  } catch (error: any) {
    console.error(`Error getting notifications for admin ${adminId}:`, error);
    return { notifications: [], count: 0, error: error.message };
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { data, error } = await supabase
      .from('admin_notifications')
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
 * Get admin dashboard stats
 */
export const getAdminDashboardStats = async () => {
  try {
    // Get total properties
    const { count: totalProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });
    
    if (propertiesError) throw propertiesError;
    
    // Get total agencies
    const { count: totalAgencies, error: agenciesError } = await supabase
      .from('agencies')
      .select('*', { count: 'exact', head: true });
    
    if (agenciesError) throw agenciesError;
    
    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (usersError) throw usersError;
    
    // Get total bookings
    const { count: totalBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });
    
    if (bookingsError) throw bookingsError;
    
    // Get recent users
    const { data: recentUsers, error: recentUsersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentUsersError) throw recentUsersError;
    
    return {
      stats: {
        totalProperties: totalProperties || 0,
        totalAgencies: totalAgencies || 0,
        totalUsers: totalUsers || 0,
        totalBookings: totalBookings || 0,
        recentUsers
      },
      error: null
    };
  } catch (error: any) {
    console.error('Error getting admin dashboard stats:', error);
    return {
      stats: null,
      error: error.message
    };
  }
};

/**
 * Get user roles count
 */
export const getUserRolesCount = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role');
    
    if (error) throw error;
    
    const roleCounts = {
      admin: 0,
      agency: 0,
      owner: 0,
      public: 0
    };
    
    data.forEach(profile => {
      if (profile.role && roleCounts.hasOwnProperty(profile.role)) {
        roleCounts[profile.role as keyof typeof roleCounts]++;
      }
    });
    
    return { roleCounts, error: null };
  } catch (error: any) {
    console.error('Error getting user roles count:', error);
    return { roleCounts: null, error: error.message };
  }
};

/**
 * Create an admin account
 */
export const createAdminAccount = async (
  userId: string,
  accessLevel: string,
  department: string,
  isSuperAdmin = false
) => {
  try {
    // Check if the user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Create the admin
    const { data, error } = await supabase
      .from('administrators')
      .insert([{
        user_id: userId,
        access_level: accessLevel,
        department,
        is_super_admin: isSuperAdmin
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the user's role to admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('user_id', userId);
    
    if (updateError) throw updateError;
    
    return { admin: data, error: null };
  } catch (error: any) {
    console.error('Error creating admin account:', error);
    return { admin: null, error: error.message };
  }
};
