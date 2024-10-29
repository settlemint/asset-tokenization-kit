import { withSettleMint } from "@settlemint/sdk-next/config/with-settlemint";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding", "debug");
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.performance = {
      hints: false,
    };
    return config;
  },
  redirects: async () => {
    return [
      {
        source: "/user",
        destination: "/user/dashboard",
        permanent: true,
      },
      {
        source: "/issuer",
        destination: "/issuer/dashboard",
        permanent: true,
      },
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: true,
      },
    ];
  },
  experimental: {
    reactCompiler: true,
  },
  output: "standalone",
};

export default withSettleMint(nextConfig);
