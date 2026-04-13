import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint runs in dev mode and CI — skip during production build
    // to avoid flat config compatibility issues with eslint-config-next
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
