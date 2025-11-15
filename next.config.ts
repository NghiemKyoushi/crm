import type { NextConfig } from "next";
import { i18n } from "./next-i18next.config";

const nextConfig: NextConfig = {
  env: {
    // Legacy env var (deprecated, use NEXT_PUBLIC_API_BASE_URL instead)
    NEXT_PUBLIC_ROOT_STATIC_URL: process.env.NEXT_PUBLIC_ROOT_STATIC_URL,

    // New env vars (recommended)
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
  },
  reactStrictMode: false,
  experimental: {
    optimizeCss: true,
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  productionBrowserSourceMaps: false,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
