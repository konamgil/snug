// Supabase - Auth 전용 (DB는 Prisma 사용)
// Client-side only exports
export { createClient, getSupabaseClient } from './client';

// Server-side exports는 직접 import 해야함:
// import { createServerSupabaseClient } from '@/shared/lib/supabase/server';
