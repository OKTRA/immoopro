
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { getUserProfile } from '@/services/authService';

type UserContextType = {
  user: User | null;
  userProfile: any | null;
  userRole: string | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  userProfile: null,
  userRole: null,
  isLoading: true,
  refreshUser: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { profile } = await getUserProfile(userId);
      setUserProfile(profile);
      setUserRole(profile?.role || null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      setUserRole(null);
    }
  };

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      
      if (data.user) {
        await fetchUserProfile(data.user.id);
      } else {
        setUserProfile(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      setUserProfile(null);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Get initial session
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
        
        if (data.session?.user) {
          await fetchUserProfile(data.session.user.id);
        }
        
        // Set up auth state listener
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event);
          setUser(session?.user || null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setUserProfile(null);
            setUserRole(null);
          }
        });
        
        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setUserProfile(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);

  return (
    <UserContext.Provider value={{ user, userProfile, userRole, isLoading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserContext;
