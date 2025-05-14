import { withSettleMint } from "@settlemint/sdk-next/config/with-settlemint";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [],
    unoptimized: false,
    formats: ["image/webp"],
  },
  experimental: {
    inlineCss: true,
    reactCompiler: true,
    authInterrupts: true,
    useCache: true,
    cacheLife: {
      session: {
        stale: 120, // 2 minutes
        revalidate: 60, // 1 minute
        expire: 240, // 4 minutes
      },
    },
  },
  output: "standalone",
  logging: {
    incomingRequests: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/:path*",
      },
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://eu.i.posthog.com/decide",
      },
      {
        source: "/:locale/media/:path*",
        destination: "/_next/static/media/:path*",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  // Streaming and Suspense
  // see https://nextjs.org/docs/app/building-your-application/deploying#streaming-and-suspense
  async headers() {
    return [
      {
        source: "/:path*{/}?",
        headers: [
          {
            key: "X-Accel-Buffering",
            value: "no",
          },
        ],
      },
    ];
  },
};

export default withSettleMint(withNextIntl(nextConfig));
