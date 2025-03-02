
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, getUserProfile } from '@/services/authService';
import { getTenantByUserId } from '@/services/tenantService';
import { getOwnerByUserId } from '@/services/ownerService';
import { getAdminByUserId } from '@/services/adminService';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type UserContextType = {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  userRole: 'public' | 'agency' | 'owner' | 'admin' | null;
  refreshUser: () => Promise<void>;
  tenantId: string | null;
  ownerId: string | null;
  adminId: string | null;
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
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'public' | 'agency' | 'owner' | 'admin' | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const { user: currentUser, error: userError } = await getCurrentUser();
      
      if (userError) {
        console.error('Error fetching current user:', userError);
        return;
      }
      
      setUser(currentUser);
      
      if (currentUser) {
        const { profile: userProfile, error: profileError } = await getUserProfile(currentUser.id);
        
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          return;
        }
        
        setProfile(userProfile);
        setUserRole(userProfile?.role || 'public');
        
        // Load role-specific IDs
        if (userProfile?.role === 'tenant' || userProfile?.role === 'public') {
          const { tenant } = await getTenantByUserId(currentUser.id);
          setTenantId(tenant?.id || null);
        }
        
        if (userProfile?.role === 'owner') {
          const { owner } = await getOwnerByUserId(currentUser.id);
          setOwnerId(owner?.id || null);
        }
        
        if (userProfile?.role === 'admin') {
          const { admin } = await getAdminByUserId(currentUser.id);
          setAdminId(admin?.id || null);
        }
      } else {
        setProfile(null);
        setUserRole('public');
        setTenantId(null);
        setOwnerId(null);
        setAdminId(null);
      }
    } catch (error) {
      console.error('Error in refreshUser:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refreshUser();
      } else if (event === 'SIGNED_OUT') {
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
      adminId
    }}>
      {children}
    </UserContext.Provider>
  );
};
