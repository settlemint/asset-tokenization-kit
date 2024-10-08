import { paraglide } from "@inlang/paraglide-next/plugin";
import { withSettleMint } from "@settlemint/sdk-next/config/with-settlemint";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding", "debug", "bcryptjs");
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.performance = {
      hints: false,
    };
    return config;
  },
};

export default withSettleMint(
  paraglide({
    paraglide: {
      project: "./project.inlang",
      outdir: "./paraglide",
    },
    ...nextConfig,
  }),
);
