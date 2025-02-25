import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  assetPrefix: '/website/',
  basePath: '/website',
  output: 'export',
};

export default nextConfig;
