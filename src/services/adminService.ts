
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { AdminNotification } from '@/assets/types';

/**
 * Get admin user by user ID
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
 * Register a new admin user
 */
export const registerAdmin = async (
  userId: string,
  accessLevel: string,
  department: string,
  isSuperAdmin = false
) => {
  try {
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
    
    return { admin: data, error: null };
  } catch (error: any) {
    console.error('Error registering admin:', error);
    return { admin: null, error: error.message };
  }
};

/**
 * Update admin access level
 */
export const updateAdminAccess = async (
  adminId: string,
  accessLevel: string,
  department?: string,
  isSuperAdmin?: boolean
) => {
  try {
    const updateData: any = { access_level: accessLevel };
    
    if (department !== undefined) {
      updateData.department = department;
    }
    
    if (isSuperAdmin !== undefined) {
      updateData.is_super_admin = isSuperAdmin;
    }
    
    const { data, error } = await supabase
      .from('administrators')
      .update(updateData)
      .eq('id', adminId)
      .select()
      .single();

    if (error) throw error;
    
    return { admin: data, error: null };
  } catch (error: any) {
    console.error(`Error updating admin access for ID ${adminId}:`, error);
    return { admin: null, error: error.message };
  }
};

/**
 * Get admin notifications
 */
export const getAdminNotifications = async (
  adminId: string,
  isRead?: boolean,
  priority?: string,
  limit = 10,
  offset = 0
) => {
  try {
    let query = supabase
      .from('admin_notifications')
      .select('*', { count: 'exact' })
      .eq('admin_id', adminId)
      .range(offset, offset + limit - 1);
    
    if (isRead !== undefined) {
      query = query.eq('is_read', isRead);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const notifications: AdminNotification[] = data.map(item => ({
      id: item.id,
      adminId: item.admin_id,
      message: item.message,
      createdAt: item.created_at,
      isRead: item.is_read,
      priority: item.priority
    }));
    
    return { notifications, count, error: null };
  } catch (error: any) {
    console.error(`Error getting notifications for admin ${adminId}:`, error);
    return { notifications: [], count: 0, error: error.message };
  }
};

/**
 * Create an admin notification
 */
export const createAdminNotification = async (notification: Omit<AdminNotification, 'id' | 'createdAt' | 'isRead'>) => {
  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert([{
        admin_id: notification.adminId,
        message: notification.message,
        priority: notification.priority,
        is_read: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    
    const newNotification: AdminNotification = {
      id: data.id,
      adminId: data.admin_id,
      message: data.message,
      createdAt: data.created_at,
      isRead: data.is_read,
      priority: data.priority
    };
    
    return { notification: newNotification, error: null };
  } catch (error: any) {
    console.error('Error creating admin notification:', error);
    return { notification: null, error: error.message };
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
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Get admin dashboard statistics
 */
export const getAdminDashboardStats = async () => {
  try {
    // Get total users count
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
      
    if (usersError) throw usersError;
    
    // Get total properties count
    const { count: propertiesCount, error: propertiesError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });
      
    if (propertiesError) throw propertiesError;
    
    // Get total agencies count
    const { count: agenciesCount, error: agenciesError } = await supabase
      .from('agencies')
      .select('*', { count: 'exact', head: true });
      
    if (agenciesError) throw agenciesError;
    
    // Get total bookings count
    const { count: bookingsCount, error: bookingsError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });
      
    if (bookingsError) throw bookingsError;
    
    // Get recent registrations
    const { data: recentUsers, error: recentUsersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (recentUsersError) throw recentUsersError;
    
    return {
      stats: {
        usersCount: usersCount || 0,
        propertiesCount: propertiesCount || 0,
        agenciesCount: agenciesCount || 0,
        bookingsCount: bookingsCount || 0,
        recentUsers
      },
      error: null
    };
  } catch (error: any) {
    console.error('Error getting admin dashboard stats:', error);
    return {
      stats: {
        usersCount: 0,
        propertiesCount: 0,
        agenciesCount: 0,
        bookingsCount: 0,
        recentUsers: []
      },
      error: error.message
    };
  }
};

/**
 * Get system status
 */
export const getSystemStatus = async () => {
  try {
    const startTime = Date.now();
    
    // Ping database to check connection
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      status: {
        databaseConnected: !error,
        responseTime,
        lastChecked: new Date().toISOString(),
        error: error ? error.message : null
      },
      error: null
    };
  } catch (error: any) {
    console.error('Error checking system status:', error);
    return {
      status: {
        databaseConnected: false,
        responseTime: 0,
        lastChecked: new Date().toISOString(),
        error: error.message
      },
      error: error.message
    };
  }
};
