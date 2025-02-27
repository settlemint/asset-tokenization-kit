import { withSettleMint } from '@settlemint/sdk-next/config/with-settlemint';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();
const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [],
    unoptimized: false,
    formats: ['image/webp'],
  },
  experimental: {
    inlineCss: true,
    reactCompiler: true,
  },
  output: 'standalone',
};

export default withSettleMint(withNextIntl(nextConfig));
