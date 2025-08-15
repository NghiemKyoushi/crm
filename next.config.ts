import type { NextConfig } from "next";
import { i18n } from "./next-i18next.config";

const nextConfig: NextConfig = {
  i18n, 
  env: {
    NEXT_PUBLIC_ROOT_STATIC_URL: process.env.NEXT_PUBLIC_ROOT_STATIC_URL,
  },
};

export default nextConfig;
