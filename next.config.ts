import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Ignore ESLint and TypeScript build-time errors so CI/builds don't fail
  // when the codebase contains lint/type issues. This matches the request
  // to leave/skip TS/ESLint errors during Next builds.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // WARNING: Skips type checking during production builds. Use with care.
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default nextConfig;
