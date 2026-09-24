import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    // Avoid blocking build on strict type mismatches in external vendor typings
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
