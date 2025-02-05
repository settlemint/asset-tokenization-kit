import { withSettleMint } from '@settlemint/sdk-next/config/with-settlemint';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding', 'debug');
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.performance = {
      hints: false,
    };
    return config;
  },
  experimental: {
    inlineCss: true,
    reactCompiler: true,
  },
  output: 'standalone',
};

export default withSettleMint(nextConfig);
