import { create } from 'zustand';
import type { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { User } from '@snug/types';
import { getSupabaseClient } from '@/shared/lib/supabase';
import { upsertUserFromAuth, getUserBySupabaseId } from '@/shared/api/user';
import { config } from '@/shared/config';
import { logLogin, logSignUp } from '@/shared/lib/firebase';

function getAppUrl(): string {
  // Client-side: always use current origin (most reliable)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Server-side fallback
  return config.app.url;
}

interface AuthState {
  // Supabase Auth 상태
  session: Session | null;
  supabaseUser: SupabaseUser | null;

  // Prisma DB 유저 상태
  user: User | null;

  // UI 상태
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    metadata?: { firstName?: string; lastName?: string },
  ) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithKakao: () => Promise<{ error: Error | null }>;
  signInWithFacebook: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  supabaseUser: null,
  user: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    const supabase = getSupabaseClient();

    try {
      // 현재 세션 가져오기
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Prisma에서 유저 정보 가져오거나 없으면 생성
        let dbUser: User | null = null;

        try {
          dbUser = await getUserBySupabaseId(session.user.id);

          // DB에 유저가 없으면 upsert
          if (!dbUser) {
            const metadata = session.user.user_metadata;
            // Kakao: name (full name) or nickname, Google: given_name/family_name
            const fullName = metadata?.name || metadata?.nickname || '';
            const firstName =
              metadata?.given_name || metadata?.first_name || fullName.split(' ')[0] || null;
            const lastName =
              metadata?.family_name ||
              metadata?.last_name ||
              fullName.split(' ').slice(1).join(' ') ||
              null;

            dbUser = await upsertUserFromAuth({
              email: session.user.email!,
              supabaseId: session.user.id,
              firstName,
              lastName,
              // Google: picture, Others: avatar_url
              avatarUrl: metadata?.picture || metadata?.avatar_url,
            });
          }
        } catch (dbError) {
          // DB 오류가 발생해도 세션은 유지 (유저 정보만 null)
          console.error('Failed to fetch/create user from DB:', dbError);
        }

        set({
          session,
          supabaseUser: session.user,
          user: dbUser,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          session: null,
          supabaseUser: null,
          user: null,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      // 초기화 실패해도 isInitialized를 true로 설정하여 페이지가 보이도록 함
      console.error('Auth initialization failed:', error);
      set({
        session: null,
        supabaseUser: null,
        user: null,
        isLoading: false,
        isInitialized: true,
      });
    }

    // Auth 상태 변경 리스너
    supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Prisma DB에 유저 upsert
        let dbUser: User | null = null;
        try {
          const metadata = session.user.user_metadata;
          // Kakao: name (full name) or nickname, Google: given_name/family_name
          const fullName = metadata?.name || metadata?.nickname || '';
          const firstName =
            metadata?.given_name || metadata?.first_name || fullName.split(' ')[0] || null;
          const lastName =
            metadata?.family_name ||
            metadata?.last_name ||
            fullName.split(' ').slice(1).join(' ') ||
            null;

          dbUser = await upsertUserFromAuth({
            email: session.user.email!,
            supabaseId: session.user.id,
            firstName,
            lastName,
            // Google: picture, Others: avatar_url
            avatarUrl: metadata?.picture || metadata?.avatar_url,
          });
          // Track login event
          const provider = session.user.app_metadata?.provider || 'email';
          logLogin(provider);
        } catch (dbError) {
          console.error('Failed to upsert user on sign in:', dbError);
        }

        set({
          session,
          supabaseUser: session.user,
          user: dbUser,
          isLoading: false,
        });
      } else if (event === 'SIGNED_OUT') {
        set({
          session: null,
          supabaseUser: null,
          user: null,
          isLoading: false,
        });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        set({ session });
      }
    });
  },

  signInWithEmail: async (email, password) => {
    set({ isLoading: true });
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false });
      return { error };
    }

    return { error: null };
  },

  signUpWithEmail: async (email, password, metadata) => {
    set({ isLoading: true });
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: metadata?.firstName,
          last_name: metadata?.lastName,
        },
      },
    });

    if (error) {
      set({ isLoading: false });
      return { error };
    }

    // Track signup event
    logSignUp('email');

    return { error: null };
  },

  signInWithGoogle: async () => {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getAppUrl()}/auth/callback`,
        scopes: 'openid email profile',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { error };
    }

    return { error: null };
  },

  signInWithKakao: async () => {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${getAppUrl()}/auth/callback`,
      },
    });

    if (error) {
      return { error };
    }

    return { error: null };
  },

  signInWithFacebook: async () => {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${getAppUrl()}/auth/callback`,
        scopes: 'email,public_profile',
      },
    });

    if (error) {
      return { error };
    }

    return { error: null };
  },

  signOut: async () => {
    set({ isLoading: true });
    const supabase = getSupabaseClient();

    await supabase.auth.signOut();

    set({
      session: null,
      supabaseUser: null,
      user: null,
      isLoading: false,
    });
  },

  refreshUser: async () => {
    const { supabaseUser } = get();
    if (!supabaseUser) return;

    const dbUser = await getUserBySupabaseId(supabaseUser.id);
    set({ user: dbUser });
  },
}));
