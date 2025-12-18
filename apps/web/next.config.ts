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

  // React Compiler (experimental)
  experimental: {
    reactCompiler: true,
  },

  // TypeScript and ESLint checks during build
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
