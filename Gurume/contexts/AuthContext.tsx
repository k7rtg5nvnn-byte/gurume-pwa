/**
 * AUTH CONTEXT
 * 
 * Global authentication state yönetimi
 * - User session
 * - Login/Logout state
 * - Profile data
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { authService } from '@/services/auth.service';
import type { User, ApiResponse } from '@/types';
import type { Session } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<ApiResponse<User>>;
  signUp: (email: string, password: string, username: string, fullName?: string) => Promise<ApiResponse<User>>;
  signOut: () => Promise<ApiResponse<void>>;
  updateProfile: (updates: Partial<User>) => Promise<ApiResponse<User>>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // İlk yükleme - mevcut session kontrolü
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Auth state değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await authService.getProfile(userId);
      setUser(profile);
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<ApiResponse<User>> => {
    const result = await authService.signIn({ email, password });
    if (result.success && result.data) {
      setUser(result.data);
    }
    return result;
  };

  const signUp = async (
    email: string,
    password: string,
    username: string,
    fullName?: string
  ): Promise<ApiResponse<User>> => {
    const result = await authService.signUp({
      email,
      password,
      username,
      fullName,
    });
    if (result.success && result.data) {
      setUser(result.data);
    }
    return result;
  };

  const signOut = async (): Promise<ApiResponse<void>> => {
    const result = await authService.signOut();
    if (result.success) {
      setUser(null);
      setSession(null);
    }
    return result;
  };

  const updateProfile = async (updates: Partial<User>): Promise<ApiResponse<User>> => {
    if (!user) {
      return {
        success: false,
        error: {
          code: 'NO_USER',
          message: 'Kullanıcı girişi yapılmamış.',
        },
      };
    }

    const result = await authService.updateProfile(user.id, updates);
    if (result.success && result.data) {
      setUser(result.data);
    }
    return result;
  };

  const refreshUser = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const value: AuthContextValue = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
