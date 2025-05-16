/**
 * Script to run the api locally
 * Makes it easier for debugging
 *
 * In Next.config.ts proxy the api routes to test inside the app:
 *    {
 *      source: "/api/:path*",
 *      destination: "http://localhost:3001/api/:path*",
 *    }
 *
 * Run with:
 * bun run kit/dapp/src/api-dev-server.ts
 */
import { mock } from "bun:test";
mock.module("server-only", () => {
  return {};
});

// Always run the api on port 3001
// next.js middleware does a proxy for the api routes, never needs to be exposed outside of the container
const port = 3001;

import("@/lib/api").then(({ api }) => {
  api.listen(port);

  console.log(`> API server listening at http://localhost:${port}`);
});
