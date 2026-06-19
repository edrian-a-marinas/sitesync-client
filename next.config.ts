import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  logging: {
    fetches: {
      fullUrl: isDev,
    },
  },
};

export default nextConfig;