
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser } from '@/services/authService';
import { getProfileByUserId } from '@/services/profileService';
import { getTenantByUserId } from '@/services/tenant/tenantService';
import { getOwnerByUserId } from '@/services/ownerService';
import { getAdminByUserId } from '@/services/adminService';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Définition des types de rôle disponibles
export type UserRole = 'public' | 'agency' | 'owner' | 'admin';

// Définition des permissions par rôle
export const rolePermissions = {
  public: ['view_properties', 'view_agencies', 'save_favorites', 'contact_agency'],
  agency: ['view_properties', 'view_agencies', 'save_favorites', 'contact_agency', 'manage_agency_profile', 'manage_properties', 'access_agency_dashboard'],
  owner: ['view_properties', 'view_agencies', 'save_favorites', 'contact_agency', 'manage_own_properties', 'access_owner_dashboard'],
  admin: ['view_properties', 'view_agencies', 'save_favorites', 'contact_agency', 'manage_agency_profile', 'manage_properties', 'access_agency_dashboard', 'manage_users', 'manage_system', 'access_admin_dashboard']
};

type UserContextType = {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  userRole: UserRole | null;
  refreshUser: () => Promise<void>;
  tenantId: string | null;
  ownerId: string | null;
  adminId: string | null;
  hasPermission: (permission: string) => boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  isLoading: true,
  userRole: null,
  refreshUser: async () => {},
  tenantId: null,
  ownerId: null,
  adminId: null,
  hasPermission: () => false,
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);

  // Fonction pour vérifier si l'utilisateur actuel a une permission spécifique
  const hasPermission = (permission: string): boolean => {
    if (!userRole) return false;
    
    const permissions = rolePermissions[userRole] || [];
    return permissions.includes(permission);
  };

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const { user: currentUser, error: userError } = await getCurrentUser();
      
      if (userError) {
        console.error('Error fetching current user:', userError);
        setUser(null);
        setProfile(null);
        setUserRole('public');
        setIsLoading(false);
        return;
      }
      
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const { profile: userProfile, error: profileError } = await getProfileByUserId(currentUser.id);
          
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            setProfile(null);
            setUserRole('public');
            setIsLoading(false);
            return;
          }
          
          setProfile(userProfile);
          setUserRole(userProfile?.role as UserRole || 'public');
          
          // Load role-specific IDs
          if (userProfile?.role === 'tenant' || userProfile?.role === 'public') {
            try {
              const { tenant } = await getTenantByUserId(currentUser.id);
              setTenantId(tenant?.id || null);
            } catch (err) {
              console.error('Error fetching tenant data:', err);
              setTenantId(null);
            }
          }
          
          if (userProfile?.role === 'owner') {
            try {
              const { owner } = await getOwnerByUserId(currentUser.id);
              setOwnerId(owner?.id || null);
            } catch (err) {
              console.error('Error fetching owner data:', err);
              setOwnerId(null);
            }
          }
          
          if (userProfile?.role === 'admin') {
            try {
              const { admin } = await getAdminByUserId(currentUser.id);
              setAdminId(admin?.id || null);
            } catch (err) {
              console.error('Error fetching admin data:', err);
              setAdminId(null);
            }
          }
        } catch (err) {
          console.error('Error in profile data fetching:', err);
          setProfile(null);
          setUserRole('public');
        }
      } else {
        // Reset state if no user
        setProfile(null);
        setUserRole('public');
        setTenantId(null);
        setOwnerId(null);
        setAdminId(null);
      }
    } catch (error) {
      console.error('Error in refreshUser:', error);
      toast.error('Échec de récupération des données utilisateur');
      // Reset state on error
      setUser(null);
      setProfile(null);
      setUserRole('public');
      setTenantId(null);
      setOwnerId(null);
      setAdminId(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await refreshUser();
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
        setProfile(null);
        setUserRole('public');
        setTenantId(null);
        setOwnerId(null);
        setAdminId(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      profile, 
      isLoading, 
      userRole, 
      refreshUser,
      tenantId,
      ownerId,
      adminId,
      hasPermission
    }}>
      {children}
    </UserContext.Provider>
  );
};
