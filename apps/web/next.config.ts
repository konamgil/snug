import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export for Capacitor
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Trailing slash for Capacitor compatibility
  trailingSlash: true,

  // Transpile internal packages
  transpilePackages: ['@snug/types'],

  // TypeScript checks during build
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
