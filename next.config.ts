import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    // next/image optimization is unavailable in a static export
    unoptimized: true,
  },
};

export default nextConfig;
