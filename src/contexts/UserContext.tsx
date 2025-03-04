
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Define the user profile type with all required properties
export interface UserProfile extends User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  agencyId?: string;
  // Add snake_case properties for backward compatibility
  first_name: string;
  last_name: string;
  avatar_url?: string;
  // Add these for Profile.tsx
  phone?: string | null;
  address?: string | null;
  // Required properties for User type
  app_metadata: object;
  user_metadata: object;
  aud: string;
  created_at: string;
}

type UserContextType = {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
  // Add the missing properties
  userRole: string | null;
  profile: UserProfile | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to get the current user role
  const getUserRole = (user: UserProfile | null): string | null => {
    return user?.role || null;
  };

  useEffect(() => {
    // Check for active session on load
    const fetchUserProfile = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error fetching session:", sessionError.message);
          return;
        }

        if (sessionData?.session) {
          setSession(sessionData.session);
          
          const userId = sessionData.session.user.id;
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (profileError) {
            console.error("Error fetching user profile:", profileError.message);
            return;
          }
          
          if (profileData) {
            const userProfile: UserProfile = {
              ...sessionData.session.user,
              id: userId,
              email: profileData.email,
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              role: profileData.role || 'public',
              avatarUrl: profileData.avatar_url,
              agencyId: profileData.agency_id,
              // Snake case for backward compatibility
              first_name: profileData.first_name || '',
              last_name: profileData.last_name || '',
              avatar_url: profileData.avatar_url,
              // Additional fields for Profile.tsx
              phone: profileData.phone || null,
              address: profileData.address || null,
              // Required fields for User type compatibility
              app_metadata: sessionData.session.user.app_metadata || {},
              user_metadata: sessionData.session.user.user_metadata || {},
              aud: sessionData.session.user.aud || 'authenticated',
              created_at: sessionData.session.user.created_at
            };
            
            setUser(userProfile);
          }
        }
      } catch (error) {
        console.error("Error during profile fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setUser(null);
      } else {
        refreshUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session?.user) {
        setUser(null);
        setSession(null);
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Erreur lors de la mise à jour du profil:", error.message);
        return;
      }
      
      if (data) {
        const userProfile = {
          ...sessionData.session.user,
          id: userId,
          email: data.email,
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          role: data.role || 'public',
          avatarUrl: data.avatar_url,
          agencyId: data.agency_id,
          // Add snake_case properties for backward compatibility
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          avatar_url: data.avatar_url,
          // Add these for Profile.tsx
          phone: data.phone || null,
          address: data.address || null,
          // Add these as required fields for compatibility with User type
          app_metadata: sessionData.session.user.app_metadata || {},
          user_metadata: sessionData.session.user.user_metadata || {},
          aud: sessionData.session.user.aud || 'authenticated',
          created_at: sessionData.session.user.created_at
        };
        setUser(userProfile);
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du profil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      refreshUser, 
      signOut,
      // Add the missing properties 
      userRole: getUserRole(user),
      profile: user
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
