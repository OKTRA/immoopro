
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, getUserProfile } from '@/services/authService';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type UserContextType = {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  userRole: 'public' | 'agency' | 'owner' | 'admin' | null;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  isLoading: true,
  userRole: null,
  refreshUser: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'public' | 'agency' | 'owner' | 'admin' | null>(null);
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
      } else {
        setProfile(null);
        setUserRole('public');
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
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, isLoading, userRole, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};
