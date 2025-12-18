/**
 * Application configuration
 */
export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Snug',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000',
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  i18n: {
    defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en',
    supportedLocales: (process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || 'en,ko,zh,ja,vi').split(','),
  },
} as const;
