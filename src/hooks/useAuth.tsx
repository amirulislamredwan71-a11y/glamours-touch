import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  adminLogin: (email: string, password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCustomAdmin, setIsCustomAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAILS = [
    'glamourstouch26@gmail.com',
    'khondokartowsif171@gmail.com',
    'amirulislamredwan71@gmail.com'
  ];

  const adminLogin = (email: string, password: string) => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'glamourstouch26@gmail.com';
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'Glamourstouch26@&';
    if (email === adminEmail && password === adminPassword) {
      const adminUser = {
        id: '00000000-0000-0000-0000-000000000000', // Valid UUID format for the mock admin
        email: 'glamourstouch26@gmail.com',
        user_metadata: { full_name: 'Glamour Admin' },
        aud: 'authenticated',
      } as any;
      setUser(adminUser);
      setIsAdmin(true);
      setIsCustomAdmin(true);
      localStorage.setItem('glamour_admin', 'true');
      return true;
    }
    return false;
  };

  const checkAdminStatus = (currentUser: User | null) => {
    if (isCustomAdmin) return true;
    const isStoredAdmin = localStorage.getItem('glamour_admin') === 'true';
    if (isStoredAdmin) {
      if (!user) {
        setUser({
          id: '00000000-0000-0000-0000-000000000000',
          email: 'glamourstouch26@gmail.com',
          user_metadata: { full_name: 'Glamour Admin' },
        } as any);
      }
      return true;
    }
    if (!currentUser || !currentUser.email) return false;
    const email = currentUser.email.toLowerCase().trim();
    return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase().trim() === email);
  };

  useEffect(() => {
    // Safety timeout to prevent stuck loading state
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Check for custom admin first
    const isStoredAdmin = localStorage.getItem('glamour_admin') === 'true';
    if (isStoredAdmin) {
      setUser({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'glamourstouch26@gmail.com',
        user_metadata: { full_name: 'Glamour Admin' },
      } as any);
      setIsAdmin(true);
      setIsCustomAdmin(true);
      setLoading(false);
      clearTimeout(timeout);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      if (!isCustomAdmin) {
        setUser(currentUser);
        setIsAdmin(checkAdminStatus(currentUser));
      }
      setLoading(false);
      clearTimeout(timeout);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isCustomAdmin) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(checkAdminStatus(currentUser));
      setLoading(false);
      clearTimeout(timeout);
      
      if (currentUser) {
        syncProfile(currentUser);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [isCustomAdmin]);

  const syncProfile = async (user: User) => {
    if (user.id === '00000000-0000-0000-0000-000000000000') return;
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata.full_name || user.user_metadata.name || user.email?.split('@')[0],
          avatar_url: user.user_metadata.avatar_url,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) console.error('Error syncing profile:', error);
    } catch (error) {
      console.error('Profile sync error:', error);
    }
  };

  const signIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      return { data, error };
    } catch (error) {
      return { error };
    }
  };

  const signUpWithEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      return { data, error };
    } catch (error) {
      return { error };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('glamour_admin');
      setIsCustomAdmin(false);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signInWithEmail, signUpWithEmail, logout, adminLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
