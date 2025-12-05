import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Production optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  eslint: {
    // Only run ESLint during builds in CI/CD
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;