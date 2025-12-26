import { createBrowserClient } from '@supabase/ssr';
import { config } from '@/shared/config';

export function createClient() {
  return createBrowserClient(config.supabase.url, config.supabase.anonKey);
}

// 싱글톤 인스턴스 (클라이언트 컴포넌트용)
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
