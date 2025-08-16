import type { NextConfig } from "next";
import { i18n } from "./next-i18next.config";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ROOT_STATIC_URL: process.env.NEXT_PUBLIC_ROOT_STATIC_URL,
  },
  reactStrictMode: false,
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
