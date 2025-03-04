import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Session, AuthError, AuthResponse } from '@supabase/supabase-js';

export interface UserProfile {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  agencyId?: string;
  // For compatibility with components using snake_case
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  // Add these for Profile.tsx
  phone?: string;
  address?: string;
  // Add these for compatibility with User type in Index.tsx
  app_metadata?: any;
  user_metadata?: any;
  aud?: string;
  created_at?: string;
}

interface UserContextType {
  user: UserProfile | null;
  profile: UserProfile | null; // Added profile property for backward compatibility
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: string | null; // Added userRole property
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      try {
        // Obtenir la session actuelle
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur de récupération de session:", error.message);
          throw error;
        }
        
        setSession(data.session);
        
        if (data.session?.user) {
          await fetchUserProfile(data.session.user.id);
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fonction pour récupérer le profil utilisateur
    const fetchUserProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error("Erreur de récupération du profil:", error.message);
          return;
        }
        
        if (data) {
          const userProfile = {
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
            // Add these for Profile.tsx (null if not present in data)
            phone: data.phone || null,
            address: data.address || null,
            // Add these for compatibility with User type
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
          };
          setUser(userProfile);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
      }
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);
        setSession(session);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fonction pour mettre à jour le profil utilisateur
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
          // Add these for compatibility with User type
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        };
        setUser(userProfile);
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du profil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error }: AuthResponse = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Erreur de connexion:", error.message);
        
        // Messages d'erreur personnalisés en français
        let errorMessage = "";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Identifiants invalides. Vérifiez votre email et mot de passe.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email non confirmé. Veuillez vérifier votre boîte mail.";
        } else {
          errorMessage = `Erreur de connexion: ${error.message}`;
        }
        
        return { error: errorMessage };
      }
      
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
      
      return { error: null };
    } catch (error: any) {
      console.error("Erreur lors de la connexion:", error);
      return { error: `Erreur interne: ${error.message}` };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error("Erreur d'inscription:", error.message);
        
        // Messages d'erreur personnalisés en français
        let errorMessage = "";
        
        if (error.message.includes("already registered")) {
          errorMessage = "Cet email est déjà enregistré. Essayez de vous connecter.";
        } else if (error.message.includes("password")) {
          errorMessage = "Le mot de passe est trop faible. Utilisez au moins 6 caractères.";
        } else {
          errorMessage = `Erreur d'inscription: ${error.message}`;
        }
        
        return { error: errorMessage };
      }
      
      return { error: null };
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      return { error: `Erreur interne: ${error.message}` };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour récupérer le profil utilisateur depuis Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Erreur de récupération du profil:", error.message);
        return;
      }
      
      if (data) {
        setUser({
          email: data.email,
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          role: data.role || 'public',
          avatarUrl: data.avatar_url,
          agencyId: data.agency_id
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
    }
  };

  const value = {
    user,
    profile: user, // Added profile property for backward compatibility
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    userRole: user?.role || null, // Added userRole derived from user.role
    signIn,
    signUp,
    signOut,
    setUser,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
