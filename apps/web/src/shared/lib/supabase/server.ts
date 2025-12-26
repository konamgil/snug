import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { config } from '@/shared/config';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(config.supabase.url, config.supabase.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component에서는 쿠키 설정 불가 - 무시
        }
      },
    },
  });
}
