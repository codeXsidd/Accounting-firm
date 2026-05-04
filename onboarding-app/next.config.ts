import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@notionhq/client'],
  experimental: {},
};

export default nextConfig;
