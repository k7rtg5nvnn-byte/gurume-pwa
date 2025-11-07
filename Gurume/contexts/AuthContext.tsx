import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type { AuthContextValue, UserProfile } from '@/types';
import type { Database } from '@/types/database';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const anonymousProfile: UserProfile = {
  id: 'anonymous',
  email: 'guest@gurume.app',
  fullName: 'Misafir',
};

function mapProfileRow(row: ProfileRow, sessionUser: User | null): UserProfile {
  return {
    id: row.id,
    email: sessionUser?.email ?? '',
    fullName: row.full_name,
    phone: row.phone,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    cityCode: row.city_code,
    districtCode: row.district_code,
    createdAt: row.created_at,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isSupabaseReady = Boolean(isSupabaseConfigured && supabase);

  const fetchProfile = useCallback(async () => {
    if (!isSupabaseReady || !supabase) {
      setProfile(anonymousProfile);
      return;
    }

    const user = session?.user;

    if (!user) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('[AuthProvider] profile fetch error', error.message);
      return;
    }

    if (!data) {
      // create placeholder profile to avoid null states
      const placeholder: Database['public']['Tables']['profiles']['Insert'] = {
        id: user.id,
        full_name: user.email?.split('@')[0] ?? 'Gurume Kullanıcısı',
      };

      const { error: upsertError } = await supabase.from('profiles').upsert(placeholder);
      if (upsertError) {
        console.warn('[AuthProvider] profile upsert error', upsertError.message);
        return;
      }

      setProfile(mapProfileRow({ ...placeholder, created_at: new Date().toISOString(), updated_at: null, phone: null, bio: null, avatar_url: null, city_code: null, district_code: null }, user));
      return;
    }

    setProfile(mapProfileRow(data, user));
  }, [isSupabaseReady, session]);

  useEffect(() => {
    let isMounted = true;

    async function initialise() {
      if (!isSupabaseReady || !supabase) {
        setProfile(anonymousProfile);
        setIsLoading(false);
        return;
      }

      const {
        data: { session: existingSession },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      setSession(existingSession);
      setIsLoading(false);
    }

    initialise();

    if (!isSupabaseReady || !supabase) {
      return () => {
        isMounted = false;
      };
    }

    const {
      data: subscription,
    } = supabase.auth.onAuthStateChange((_event, authSession) => {
      setSession(authSession);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [isSupabaseReady]);

  useEffect(() => {
    if (!session) {
      setProfile(isSupabaseReady ? null : anonymousProfile);
      return;
    }

    fetchProfile();
  }, [session, isSupabaseReady, fetchProfile]);

  const signIn = useCallback<AuthContextValue['signIn']>(
    async ({ email, password }) => {
      if (!isSupabaseReady || !supabase) {
        console.warn('[AuthProvider] Supabase is not configured. signIn skipped.');
        return;
      }

      setIsLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isSupabaseReady],
  );

  const signUp = useCallback<AuthContextValue['signUp']>(
    async ({ email, password, phone, fullName }) => {
      if (!isSupabaseReady || !supabase) {
        console.warn('[AuthProvider] Supabase is not configured. signUp skipped.');
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          phone,
          options: {
            data: {
              phone,
              full_name: fullName,
            },
          },
        });

        if (error) {
          throw error;
        }

        const userId = data.user?.id;

        if (userId) {
          const { error: upsertError } = await supabase.from('profiles').upsert({
            id: userId,
            full_name: fullName ?? email.split('@')[0],
            phone: phone ?? null,
          });

          if (upsertError) {
            console.warn('[AuthProvider] profile upsert after signUp error', upsertError.message);
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isSupabaseReady],
  );

  const signOut = useCallback(async () => {
    if (!isSupabaseReady || !supabase) {
      setProfile(anonymousProfile);
      setSession(null);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setSession(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseReady]);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    async (input) => {
      if (!isSupabaseReady || !supabase) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                ...input,
              }
            : prev,
        );
        return;
      }

      const userId = session?.user?.id;
      if (!userId) {
        return;
      }

      const payload: Database['public']['Tables']['profiles']['Update'] = {
        id: userId,
        full_name: input.fullName ?? undefined,
        phone: input.phone ?? undefined,
        bio: input.bio ?? undefined,
        avatar_url: input.avatarUrl ?? undefined,
        city_code: input.cityCode ?? undefined,
        district_code: input.districtCode ?? undefined,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(payload);

      if (error) {
        console.warn('[AuthProvider] updateProfile error', error.message);
        return;
      }

      await fetchProfile();
    },
    [fetchProfile, isSupabaseReady, session?.user?.id],
  );

  const value: AuthContextValue = useMemo(
    () => ({
      isLoading,
      isSupabaseReady,
      sessionUserId: session?.user?.id ?? null,
      profile: profile ?? (isSupabaseReady ? null : anonymousProfile),
      signIn,
      signUp,
      signOut,
      updateProfile,
      refreshProfile: fetchProfile,
    }),
    [fetchProfile, isLoading, isSupabaseReady, profile, session?.user?.id, signIn, signOut, signUp, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
