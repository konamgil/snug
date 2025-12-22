import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isExport = process.env.WEB_BUILD === 'export';

const nextConfig: NextConfig = {
  // Static export for Capacitor builds
  output: isExport ? 'export' : undefined,

  // Disable image optimization for static export
  images: {
    unoptimized: isExport,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },

  // Trailing slash for Capacitor compatibility
  trailingSlash: isExport,

  // Transpile internal packages
  transpilePackages: ['@snug/types'],

  // TypeScript checks during build
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withNextIntl(nextConfig);
