
import { supabase, handleSupabaseError, getMockData, isSupabaseConnected } from '@/lib/supabase';
import { AdminNotification } from '@/assets/types';
import { toast } from 'sonner';

/**
 * Get admin user by user ID
 */
export const getAdminByUserId = async (userId: string) => {
  try {
    // Check Supabase connection first
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Use mock data
      const mockAdmin = {
        id: 'mock-admin-1',
        user_id: userId,
        access_level: 'full',
        department: 'Management',
        is_super_admin: true
      };
      
      return { admin: mockAdmin, error: null };
    }
    
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
    // Check Supabase connection first
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Use mock notifications
      const mockNotifications: AdminNotification[] = Array.from({ length: limit }, (_, i) => ({
        id: `mock-notification-${i + 1}`,
        adminId,
        message: `Notification de test #${i + 1} pour l'administrateur`,
        date: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
        read: isRead !== undefined ? isRead : Math.random() > 0.5,
        createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
        isRead: isRead !== undefined ? isRead : Math.random() > 0.5,
        priority: priority || ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
      }));
      
      return { 
        notifications: mockNotifications, 
        count: 25, // Simulate total count
        error: null 
      };
    }
    
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
      date: item.created_at, // Map created_at to date
      read: item.is_read, // Map is_read to read
      createdAt: item.created_at,
      isRead: item.is_read,
      priority: item.priority
    }));
    
    return { notifications, count, error: null };
  } catch (error: any) {
    console.error(`Error getting notifications for admin ${adminId}:`, error);
    toast.error(`Erreur lors de la récupération des notifications: ${error.message}`);
    return { notifications: [], count: 0, error: error.message };
  }
};

/**
 * Create an admin notification
 */
export const createAdminNotification = async (notification: Omit<AdminNotification, 'id' | 'createdAt' | 'isRead' | 'date' | 'read'>) => {
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
      date: data.created_at, // Map created_at to date
      read: data.is_read, // Map is_read to read
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
    // Check Supabase connection first
    const connected = await isSupabaseConnected();
    
    if (!connected) {
      // Use mock statistics
      return {
        stats: {
          usersCount: 157,
          propertiesCount: 89,
          agenciesCount: 12,
          bookingsCount: 243,
          recentUsers: Array.from({ length: 5 }, (_, i) => ({
            id: `mock-user-${i + 1}`,
            first_name: ['Jean', 'Marie', 'Sophie', 'Thomas', 'Émilie'][i],
            last_name: ['Dupont', 'Martin', 'Bernard', 'Petit', 'Durand'][i],
            email: `user${i + 1}@example.com`,
            created_at: new Date(Date.now() - i * 86400000).toISOString()
          }))
        },
        error: null
      };
    }
    
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
    toast.error(`Erreur lors de la récupération des statistiques: ${error.message}`);
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
    
    // Check connection state
    const connected = await isSupabaseConnected();
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      status: {
        databaseConnected: connected,
        responseTime,
        lastChecked: new Date().toISOString(),
        error: connected ? null : "Database connection failed"
      },
      error: null
    };
  } catch (error: any) {
    console.error('Error checking system status:', error);
    toast.error(`Erreur lors de la vérification du statut système: ${error.message}`);
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
