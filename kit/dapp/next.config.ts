import { withSettleMint } from '@settlemint/sdk-next/config/with-settlemint';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding', 'debug');
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.performance = {
      hints: false,
    };
    return config;
  },
  experimental: {
    reactCompiler: true,
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  output: 'standalone',
};

export default withSettleMint(nextConfig);
